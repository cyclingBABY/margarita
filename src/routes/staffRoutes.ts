import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth.js';
import { getPool } from '../db/index.js';

const router = Router();
router.use(authenticateToken, authorizeRoles('admin', 'staff'));

// Existing: Get all reservations
router.get('/reservations', async (req, res) => {
  try {
    const { guestId } = req.query;
    let reservations;
    if (guestId) {
      [reservations] = await getPool().query('SELECT * FROM reservations WHERE guestId = ? ORDER BY createdAt DESC', [guestId]);
    } else {
      [reservations] = await getPool().query('SELECT * FROM reservations ORDER BY createdAt DESC');
    }
    res.json(reservations);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Existing: Create a reservation (staff overrides)
router.post('/reservations', async (req, res) => {
  try {
    const { guestId, guestName, roomId, roomNumber, checkInDate, checkOutDate, totalAmount } = req.body;
    await getPool().query(`
      INSERT INTO reservations (guestId, guestName, roomId, roomNumber, checkInDate, checkOutDate, totalAmount, status, paymentStatus, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [guestId, guestName, roomId, roomNumber, checkInDate, checkOutDate, totalAmount, 'confirmed', 'pending', new Date().toISOString()]);
    res.status(201).json({ message: 'Reservation created' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update Reservation Status (Approve/Reject)
router.patch('/reservations/:id/status', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body; // status: 'confirmed' | 'cancelled', paymentStatus optional
    const adminId = req.user?.uid;
    
    console.log('Updating reservation status:', { id, status, paymentStatus, adminId });
    
    const pool = getPool();
    const approvedAt = status === 'confirmed' ? new Date().toISOString() : null;
    const approvedBy = status === 'confirmed' ? adminId : null;
    
    const [updateResult] = await pool.query(
      'UPDATE reservations SET status = ?, approvedBy = ?, approvedAt = ? WHERE id = ?', 
      [status, approvedBy, approvedAt, id]
    );
    
    console.log('Update result:', updateResult);
    
    // If confirmed, mark room as occupied, notify guest, auto-generate invoice
    if (status === 'confirmed') {
      const [resData]: any = await pool.query(
        'SELECT roomId, guestId, roomNumber, totalAmount, checkOutDate FROM reservations WHERE id = ?', 
        [id]
      );
      if (resData.length > 0) {
        const { roomId, guestId, roomNumber, totalAmount, checkOutDate } = resData[0];
        await pool.query('UPDATE rooms SET status = "occupied" WHERE id = ?', [roomId]);
        
        // Notify Guest
        await pool.query('INSERT INTO notifications (guestId, message, createdAt) VALUES (?, ?, ?)', 
          [guestId, `Your reservation for Room ${roomNumber} has been approved!`, new Date().toISOString()]);
        
        // Normalize paymentStatus to a valid invoice status for analytics
        const invoiceStatus = paymentStatus === 'paid' ? 'paid' : paymentStatus === 'refunded' ? 'refunded' : 'unpaid';
        
        // Auto-generate or update invoice
        const [existingInvoices]: any = await pool.query(
          'SELECT id FROM invoices WHERE reservationId = ? LIMIT 1', [id]
        );
        if (existingInvoices.length === 0) {
          await pool.query(
            'INSERT INTO invoices (reservationId, guestId, amount, status, issueDate, dueDate) VALUES (?, ?, ?, ?, ?, ?)',
            [id, guestId, totalAmount, invoiceStatus, new Date().toISOString(), checkOutDate || new Date().toISOString()]
          );
        } else {
          await pool.query(
            'UPDATE invoices SET amount = ?, status = ?, dueDate = ? WHERE reservationId = ?',
            [totalAmount, invoiceStatus, checkOutDate || new Date().toISOString(), id]
          );
        }
        
        // If payment status also provided, update reservation paymentStatus
        if (paymentStatus) {
          await pool.query('UPDATE reservations SET paymentStatus = ? WHERE id = ?', [paymentStatus, id]);
        }
        
        // Log admin action
        await pool.query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
          [adminId, `Approved reservation #${id} for Room ${roomNumber}. Invoice generated. Payment: ${paymentStatus || 'unpaid'}`, new Date().toISOString()]);
      }
    }
    
    if (status === 'cancelled') {
      // Get guestId for notification
      const [resData]: any = await pool.query('SELECT guestId, roomNumber FROM reservations WHERE id = ?', [id]);
      const guestId = resData.length > 0 ? resData[0].guestId : null;
      // Cancel any pending invoice
      await pool.query('UPDATE invoices SET status = ? WHERE reservationId = ?', ['cancelled', id]);
      if (guestId) {
        await pool.query('INSERT INTO notifications (guestId, message, createdAt) VALUES (?, ?, ?)', 
          [guestId, `Your reservation has been cancelled.`, new Date().toISOString()]);
      }
      await pool.query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
        [adminId, `Cancelled reservation #${id}`, new Date().toISOString()]);
    }
    
    res.json({ message: `Reservation status updated to ${status}` });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update Reservation Payment Status
router.patch('/reservations/:id/payment-status', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const adminId = req.user?.uid;
    if (!paymentStatus || !['paid', 'pending', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    await getPool().query('UPDATE reservations SET paymentStatus = ? WHERE id = ?', [paymentStatus, id]);

    // Sync corresponding invoice status so analytics reflect the change
    const invoiceStatus = paymentStatus === 'paid' ? 'paid' : paymentStatus === 'refunded' ? 'refunded' : 'unpaid';
    await getPool().query('UPDATE invoices SET status = ? WHERE reservationId = ?', [invoiceStatus, id]);

    await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
      [adminId, `Reservation #${id} payment marked as ${paymentStatus}. Invoice synced to ${invoiceStatus}.`, new Date().toISOString()]);

    res.json({ message: `Payment status updated to ${paymentStatus}`, invoiceSynced: invoiceStatus });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update Room Service Payment Status
router.patch('/room-service/:id/payment-status', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    if (!paymentStatus || !['paid', 'pending', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    await getPool().query('UPDATE room_service_orders SET paymentStatus = ? WHERE id = ?', [paymentStatus, id]);
    res.json({ message: `Payment status updated to ${paymentStatus}` });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Existing: Get Feedback
router.get('/feedback', async (req, res) => {
  try {
    const [feedback] = await getPool().query('SELECT * FROM feedback ORDER BY createdAt DESC');
    res.json(feedback);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Check-in
router.post('/checkin', async (req, res) => {
    try {
        const { reservationId } = req.body;
        await getPool().query('UPDATE reservations SET status = "checked-in" WHERE id = ?', [reservationId]);
        res.json({ message: "Guest successfully checked in." });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Check-out
router.post('/checkout', async (req, res) => {
    try {
        const { reservationId } = req.body;
        await getPool().query('UPDATE reservations SET status = "checked-out" WHERE id = ?', [reservationId]);
        res.json({ message: "Guest successfully checked out." });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get Billing Invoices
router.get('/billing', async (req, res) => {
    try {
        const [invoices] = await getPool().query('SELECT * FROM invoices ORDER BY issueDate DESC');
        res.json(invoices);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Generate Invoice
router.post('/billing', async (req, res) => {
    try {
        const { reservationId, guestId, amount, dueDate } = req.body;
        await getPool().query('INSERT INTO invoices (reservationId, guestId, amount, issueDate, dueDate) VALUES (?, ?, ?, ?, ?)',
            [reservationId, guestId, amount, new Date().toISOString(), dueDate]);
        res.status(201).json({ message: "Invoice generated successfully." });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Event Scheduling
router.post('/events', async (req, res) => {
    try {
        const { title, description, organizerId, organizerName, date, location, status } = req.body;
        await getPool().query('INSERT INTO events (title, description, organizerId, organizerName, date, location, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, organizerId, organizerName, date, location, status || 'scheduled']);
        res.status(201).json({ message: "Event scheduled successfully." });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Room Service Management
router.get('/room-service', async (req, res) => {
    try {
        const [orders] = await getPool().query(`
            SELECT rso.*, r.checkOutDate,
                   DATEDIFF(r.checkOutDate, CURDATE()) as daysRemaining
            FROM room_service_orders rso
            JOIN reservations r ON rso.reservationId = r.id
            ORDER BY rso.createdAt DESC
        `);
        
        // Parse items JSON - orders is already an array from the query result
        const parsedOrders = (orders as any[]).map((order: any) => ({
            ...order,
            items: JSON.parse(order.items)
        }));
        
        res.json(parsedOrders);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update Room Service Order Status
router.patch('/room-service/:id/status', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // preparing, ready, delivered, cancelled
        const adminId = req.user?.uid;
        
        // Validate status
        const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Get order details before updating
        const [ordersBefore]: any = await getPool().query('SELECT guestId, roomNumber FROM room_service_orders WHERE id = ?', [id]);
        if (ordersBefore.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = ordersBefore[0];
        
        // Update order status
        await getPool().query('UPDATE room_service_orders SET status = ?, updatedAt = ? WHERE id = ?', 
            [status, new Date().toISOString(), id]);
        
        // Send notification to guest based on status
        const statusMessages: { [key: string]: string } = {
            'preparing': `Your room service order for Room ${order.roomNumber} is being prepared! 👨‍🍳`,
            'ready': `Your room service order for Room ${order.roomNumber} is ready! We'll bring it shortly. 🚚`,
            'delivered': `Your room service order for Room ${order.roomNumber} has been delivered! Enjoy! 🎉`,
            'cancelled': `Your room service order for Room ${order.roomNumber} has been cancelled.`
        };

        if (statusMessages[status]) {
            await getPool().query('INSERT INTO notifications (guestId, message, type, createdAt) VALUES (?, ?, ?, ?)', 
                [order.guestId, statusMessages[status], 'room-service', new Date().toISOString()]).catch(() => {
                    // If notifications table doesn't have type column, insert without it
                    return getPool().query('INSERT INTO notifications (guestId, message, createdAt) VALUES (?, ?, ?)', 
                        [order.guestId, statusMessages[status], new Date().toISOString()]);
                });
        }

        // Log the status update
        await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
            [req.user?.uid || null, `Room Service Order #${id}: Status updated to ${status} - Room ${order.roomNumber}`, new Date().toISOString()]);
        
        res.json({ message: `Order status updated to ${status}` });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update Room Service Payment Status
router.patch('/room-service/:id/payment-status', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;
        const adminId = req.user?.uid;
        if (!paymentStatus || !['paid', 'pending', 'unpaid', 'refunded'].includes(paymentStatus)) {
            return res.status(400).json({ error: 'Invalid payment status' });
        }
        await getPool().query('UPDATE room_service_orders SET paymentStatus = ? WHERE id = ?', [paymentStatus, id]);
        await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
            [adminId, `Room Service Order #${id}: Payment status updated to ${paymentStatus}`, new Date().toISOString()]);
        res.json({ message: `Payment status updated to ${paymentStatus}` });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- Spa Bookings Management ---

// Get all spa bookings
router.get('/spa-bookings', async (req, res) => {
    try {
        const [bookings] = await getPool().query('SELECT * FROM spa_bookings ORDER BY createdAt DESC');
        res.json(bookings);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update Spa Booking Status (Approve/Reject/Complete)
router.patch('/spa-bookings/:id/status', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;
        const adminId = req.user?.uid;
        
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const pool = getPool();
        const approvedAt = status === 'confirmed' ? new Date().toISOString() : null;
        const approvedBy = status === 'confirmed' ? adminId : null;
        
        await pool.query(
            'UPDATE spa_bookings SET status = ?, approvedBy = ?, approvedAt = ? WHERE id = ?',
            [status, approvedBy, approvedAt, id]
        );
        
        const [bookingData]: any = await pool.query('SELECT guestId, guestName, serviceLabel, price FROM spa_bookings WHERE id = ?', [id]);
        if (bookingData.length > 0) {
            const { guestId, guestName, serviceLabel, price } = bookingData[0];
            
            if (status === 'confirmed') {
                await pool.query('INSERT INTO notifications (guestId, message, createdAt) VALUES (?, ?, ?)',
                    [guestId, `Your spa booking for ${serviceLabel} has been confirmed!`, new Date().toISOString()]);
                
                if (paymentStatus) {
                    await pool.query('UPDATE spa_bookings SET paymentStatus = ? WHERE id = ?', [paymentStatus, id]);
                }
                
                await pool.query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
                    [adminId, `Approved spa booking #${id} for ${guestName} (${serviceLabel}). Payment: ${paymentStatus || 'pending'}`, new Date().toISOString()]);
            }
            
            if (status === 'cancelled') {
                await pool.query('INSERT INTO notifications (guestId, message, createdAt) VALUES (?, ?, ?)',
                    [guestId, `Your spa booking for ${serviceLabel} has been cancelled.`, new Date().toISOString()]);
                await pool.query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
                    [adminId, `Cancelled spa booking #${id} for ${guestName} (${serviceLabel})`, new Date().toISOString()]);
            }
            
            if (status === 'completed') {
                await pool.query('INSERT INTO notifications (guestId, message, createdAt) VALUES (?, ?, ?)',
                    [guestId, `Your spa session for ${serviceLabel} has been completed. Thank you!`, new Date().toISOString()]);
                await pool.query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
                    [adminId, `Completed spa booking #${id} for ${guestName} (${serviceLabel})`, new Date().toISOString()]);
            }
        }
        
        res.json({ message: `Spa booking status updated to ${status}` });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update Spa Booking Payment Status
router.patch('/spa-bookings/:id/payment-status', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;
        const adminId = req.user?.uid;
        if (!paymentStatus || !['paid', 'pending', 'unpaid', 'refunded'].includes(paymentStatus)) {
            return res.status(400).json({ error: 'Invalid payment status' });
        }
        await getPool().query('UPDATE spa_bookings SET paymentStatus = ? WHERE id = ?', [paymentStatus, id]);
        await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
            [adminId, `Spa Booking #${id}: Payment status updated to ${paymentStatus}`, new Date().toISOString()]);
        res.json({ message: `Payment status updated to ${paymentStatus}` });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get Receipt Data for a Reservation (admin/staff)
router.get('/reservations/:id/receipt', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        // Fetch reservation with room details
        const [reservations]: any = await getPool().query(
            `SELECT r.*, rooms.type as roomType, rooms.pricePerNight
             FROM reservations r
             LEFT JOIN rooms ON r.roomId = rooms.id
             WHERE r.id = ?`,
            [id]
        );
        if (reservations.length === 0) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        const reservation = reservations[0];

        // Fetch room service orders for this reservation
        const [roomServiceOrders]: any = await getPool().query(
            'SELECT id, items, totalAmount, status, createdAt FROM room_service_orders WHERE reservationId = ?',
            [id]
        );
        const parsedRoomServiceOrders = roomServiceOrders.map((order: any) => ({
            ...order,
            items: JSON.parse(order.items)
        }));

        // Fetch invoice if any
        const [invoices]: any = await getPool().query(
            'SELECT id, amount, status, issueDate FROM invoices WHERE reservationId = ? LIMIT 1',
            [id]
        );

        res.json({
            reservation,
            roomServiceOrders: parsedRoomServiceOrders,
            invoice: invoices.length > 0 ? invoices[0] : null
        });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
