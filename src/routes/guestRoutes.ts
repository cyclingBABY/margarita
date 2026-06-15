import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth.js';
import { getPool } from '../db/index.js';

const router = Router();

// Allow public browsing of rooms for guests booking
router.get('/rooms/available', async (req, res) => {
    try {
      const [rooms] = await getPool().query('SELECT * FROM rooms WHERE status = "available" ORDER BY number ASC');
      res.json(rooms);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Everything underneath requires them to be authenticated as guest
router.use(authenticateToken, authorizeRoles('guest', 'admin', 'staff'));

// Get Guest Reservations
router.get('/reservations', async (req: AuthRequest, res) => {
    try {
        const guestId = req.user?.uid;
        const [reservations] = await getPool().query('SELECT * FROM reservations WHERE guestId = ? ORDER BY createdAt DESC', [guestId]);
        res.json(reservations);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Guest Booking
router.post('/book', async (req: AuthRequest, res) => {
    try {
        const { roomId, roomNumber, checkInDate, checkOutDate, totalAmount } = req.body;
        const guestId = req.user?.uid;
        
        if (!guestId) {
            return res.status(401).json({ error: 'User ID not found in token' });
        }
        
        // Ensure user exists in database (auto-create if missing to satisfy FK constraint)
        const [users]: any = await getPool().query('SELECT displayName FROM users WHERE uid = ?', [guestId]);
        let guestName = 'Guest';
        if (users.length > 0) {
            guestName = users[0].displayName || 'Guest';
        } else {
            // Auto-create user if not found (prevents FK constraint failure)
            await getPool().query(
                'INSERT INTO users (uid, displayName, role, accountStatus, createdAt) VALUES (?, ?, ?, ?, ?)',
                [guestId, 'Guest', 'guest', 'Active', new Date().toISOString()]
            );
        }
        
        // Validate required fields
        if (!roomId || !roomNumber || !checkInDate || !checkOutDate || totalAmount === undefined) {
            return res.status(400).json({ error: 'Missing required booking fields' });
        }
        
        await getPool().query(`
          INSERT INTO reservations (guestId, guestName, roomId, roomNumber, checkInDate, checkOutDate, totalAmount, status, paymentStatus, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [guestId, guestName, roomId, roomNumber, checkInDate, checkOutDate, totalAmount, 'pending', 'pending', new Date().toISOString()]);
        
        // Log the booking for admin visibility
        await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
          [null, `New booking by ${guestName} for Room ${roomNumber} (${checkInDate} to ${checkOutDate})`, new Date().toISOString()]);
        
        res.status(201).json({ message: 'Room booked successfully' });
    } catch (err: any) { 
        console.error('Booking error:', err);
        res.status(500).json({ error: err.message || 'Booking failed due to server error' }); 
    }
});

// Guest Submitting Feedback
router.post('/feedback', async (req: AuthRequest, res) => {
    try {
      const { rating, comment, serviceType, serviceId } = req.body;
      const guestId = req.user?.uid;
      if (!rating || !comment || !comment.trim()) {
        return res.status(400).json({ error: 'Rating and comment are required.' });
      }
      await getPool().query(
        'INSERT INTO feedback (guestId, guestName, rating, comment, serviceType, serviceId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [guestId, 'Guest', rating, comment.trim(), serviceType || 'general', serviceId || null, new Date().toISOString()]
      );
      res.status(201).json({ message: 'Feedback submitted' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get Guest's Submitted Feedback
router.get('/feedback', async (req: AuthRequest, res) => {
    try {
      const guestId = req.user?.uid;
      const [feedback] = await getPool().query(
        'SELECT * FROM feedback WHERE guestId = ? ORDER BY createdAt DESC',
        [guestId]
      );
      res.json(feedback);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get Eligible Services for Feedback
router.get('/feedback/eligible-services', async (req: AuthRequest, res) => {
    try {
      const guestId = req.user?.uid;
      const eligibleServices: any[] = [];

      // Status variants to be tolerant of data differences
      const deliveredStatuses = ['delivered', 'completed', 'done', 'ready', 'served'];
      const checkedOutStatuses = ['checked-out', 'checked_out', 'checkedout', 'complete', 'completed'];

      // Delivered room service orders
      const [roomService]: any = await getPool().query(
        `SELECT id, guestName, roomNumber, totalAmount, status, createdAt
         FROM room_service_orders
         WHERE guestId = ? AND status IN (?)`,
        [guestId, deliveredStatuses]
      );

      roomService.forEach((order: any) => {
        eligibleServices.push({
          type: 'room-service',
          id: order.id.toString(),
          title: `Room Service Order #${order.id}`,
          description: `Room ${order.roomNumber} - UGX ${Number(order.totalAmount).toLocaleString()}`,
          date: order.createdAt
        });
      });

      // Checked-out reservations
      const [reservations]: any = await getPool().query(
        `SELECT id, roomNumber, checkInDate, checkOutDate, status
         FROM reservations
         WHERE guestId = ? AND status IN (?)`,
        [guestId, checkedOutStatuses]
      );

      reservations.forEach((resItem: any) => {
        eligibleServices.push({
          type: 'reservation',
          id: resItem.id.toString(),
          title: `Stay in Room ${resItem.roomNumber}`,
          description: `${new Date(resItem.checkInDate).toLocaleDateString()} - ${new Date(resItem.checkOutDate).toLocaleDateString()}`,
          date: resItem.checkOutDate
        });
      });

      // Check which services already have feedback
      const [existingFeedback]: any = await getPool().query(
        'SELECT serviceType, serviceId FROM feedback WHERE guestId = ?',
        [guestId]
      );
      const reviewedKeys = new Set(existingFeedback.map((f: any) => `${f.serviceType}-${f.serviceId}`));

      const pending = eligibleServices.filter(s => !reviewedKeys.has(`${s.type}-${s.id}`));

      // Debug counts (harmless for UI): client can ignore these fields
      const debug = {
        totalEligible: eligibleServices.length,
        totalPending: pending.length,
        eligibleFromRoomService: eligibleServices.filter(s => s.type === 'room-service').length,
        eligibleFromReservations: eligibleServices.filter(s => s.type === 'reservation').length
      };

      res.json({ pending, debug });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
});


// Remote Check-In
router.post('/remote-checkin', async (req: AuthRequest, res) => {
    try {
        const { reservationId } = req.body;
        const guestId = req.user?.uid;
        // Basic check if reservation belongs to guest
        const [reservations]: any = await getPool().query('SELECT * FROM reservations WHERE id = ? AND guestId = ?', [reservationId, guestId]);
        if (reservations.length === 0) return res.status(403).json({ error: "Reservation not found."});
        
        await getPool().query('UPDATE reservations SET status = "checked-in" WHERE id = ?', [reservationId]);
        res.json({ message: "Remote check-in successful." });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Debug endpoint to check user reservations
router.get('/debug-reservations', async (req: AuthRequest, res) => {
    try {
        const guestId = req.user?.uid;
        const [reservations] = await getPool().query('SELECT * FROM reservations WHERE guestId = ? ORDER BY createdAt DESC', [guestId]);
        res.json({ guestId, reservations });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Room Service Order
router.post('/room-service', async (req: AuthRequest, res) => {
    try {
        const { items, specialInstructions, estimatedDeliveryTime } = req.body;
        const guestId = req.user?.uid;
        
        console.log('Room service order request:', { guestId, items, specialInstructions, estimatedDeliveryTime });
        
        if (!guestId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Missing required fields or invalid items array' });
        }
        
        // Get guest details and current reservation
        const [users]: any = await getPool().query('SELECT displayName FROM users WHERE uid = ?', [guestId]);
        const guestName = users[0]?.displayName || 'Guest';
        
        // Get current active reservation (allow checked-in or confirmed)
        const [reservations]: any = await getPool().query(`
            SELECT id, roomNumber, checkOutDate, status 
            FROM reservations 
            WHERE guestId = ? AND status IN ('checked-in', 'confirmed') 
            ORDER BY createdAt DESC LIMIT 1
        `, [guestId]);
        
        console.log('Room service order - Guest reservations:', reservations);
        
        if (reservations.length === 0) {
            // Check what reservations exist for this user
            const [allReservations]: any = await getPool().query(`
                SELECT id, roomNumber, checkOutDate, status 
                FROM reservations 
                WHERE guestId = ? 
                ORDER BY createdAt DESC LIMIT 5
            `, [guestId]);
            console.log('All reservations for guest:', allReservations);
            return res.status(400).json({ error: 'No active reservation found. Please check-in first or contact reception.' });
        }
        
        const reservation = reservations[0];
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        
        // Calculate days remaining
        const checkOutDate = new Date(reservation.checkOutDate);
        const today = new Date();
        const daysRemaining = Math.ceil((checkOutDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        // Create room service order
        await getPool().query(`
            INSERT INTO room_service_orders 
            (guestId, guestName, roomNumber, reservationId, items, totalAmount, status, specialInstructions, estimatedDeliveryTime, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            guestId, 
            guestName, 
            reservation.roomNumber, 
            reservation.id,
            JSON.stringify(items),
            totalAmount,
            'pending',
            specialInstructions || '',
            estimatedDeliveryTime || '',
            new Date().toISOString(),
            new Date().toISOString()
        ]);
        
        // Log for admin notification
        await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
            [null, `Room Service Order: ${guestName} in Room ${reservation.roomNumber} - ${daysRemaining} days remaining - Total: UGX ${totalAmount}`, new Date().toISOString()]);
        
        res.status(201).json({ message: 'Room service order placed successfully' });
    } catch (err: any) { 
        console.error('Room service error:', err);
        res.status(500).json({ error: err.message || 'Room service order failed' }); 
    }
});

// Get Guest Room Service Orders
router.get('/room-service', async (req: AuthRequest, res) => {
    try {
        const guestId = req.user?.uid;
        const [orders] = await getPool().query('SELECT * FROM room_service_orders WHERE guestId = ? ORDER BY createdAt DESC', [guestId]);
        
        // Parse items JSON - orders is already an array from the query result
        const parsedOrders = (orders as any[]).map((order: any) => ({
            ...order,
            items: JSON.parse(order.items)
        }));
        
        res.json(parsedOrders);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get Guest Notifications
router.get('/notifications', async (req: AuthRequest, res) => {
    try {
        const guestId = req.user?.uid;
        const [notifications] = await getPool().query(
            'SELECT * FROM notifications WHERE guestId = ? ORDER BY createdAt DESC LIMIT 50',
            [guestId]
        );
        res.json(notifications);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Mark Notification as Read
router.patch('/notifications/:id/read', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const guestId = req.user?.uid;
        await getPool().query('UPDATE notifications SET isRead = 1 WHERE id = ? AND guestId = ?', [id, guestId]);
        res.json({ message: "Notification marked as read." });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Service Request
router.post('/service-requests', async (req: AuthRequest, res) => {
    try {
        const { roomId, requestType, description } = req.body;
        const guestId = req.user?.uid;
        await getPool().query('INSERT INTO service_requests (guestId, roomId, requestType, description, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
            [guestId, roomId, requestType, description, 'open', new Date().toISOString()]);
        res.status(201).json({ message: "Service request submitted successfully." });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- Messaging Endpoints ---

// Send message to Admin
router.post('/messages', async (req: AuthRequest, res) => {
    try {
        const { content } = req.body;
        const senderId = req.user?.uid;
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Message content is required.' });
        }
        await getPool().query(
            'INSERT INTO messages (senderId, receiverId, content, timestamp, readStatus) VALUES (?, ?, ?, ?, ?)',
            [senderId, 'admin', content.trim(), new Date().toISOString(), 0]
        );
        res.status(201).json({ message: 'Message sent successfully.' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get Guest Conversation History
router.get('/messages', async (req: AuthRequest, res) => {
    try {
        const guestId = req.user?.uid;
        const [messages] = await getPool().query(
            'SELECT * FROM messages WHERE senderId = ? OR receiverId = ? ORDER BY timestamp ASC',
            [guestId, guestId]
        );
        res.json(messages);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Mark Message as Read
router.patch('/messages/:id/read', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const guestId = req.user?.uid;
        await getPool().query(
            'UPDATE messages SET readStatus = 1 WHERE id = ? AND receiverId = ?',
            [id, guestId]
        );
        res.json({ message: "Message marked as read." });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- Spa Booking Endpoints ---

// Create Spa Booking
router.post('/spa-bookings', async (req: AuthRequest, res) => {
    try {
        const { service, serviceLabel, price, bookingDate, bookingTime, notes } = req.body;
        const guestId = req.user?.uid;
        
        if (!guestId || !service || !bookingDate || !bookingTime) {
            return res.status(400).json({ error: 'Missing required spa booking fields' });
        }
        
        const [users]: any = await getPool().query('SELECT displayName FROM users WHERE uid = ?', [guestId]);
        const guestName = users[0]?.displayName || 'Guest';
        
        // Get current active reservation for room number
        const [reservations]: any = await getPool().query(
            'SELECT roomNumber FROM reservations WHERE guestId = ? AND status IN ("checked-in", "confirmed") ORDER BY createdAt DESC LIMIT 1',
            [guestId]
        );
        const roomNumber = reservations[0]?.roomNumber || '';
        
        await getPool().query(
            'INSERT INTO spa_bookings (guestId, guestName, roomNumber, service, serviceLabel, price, bookingDate, bookingTime, notes, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [guestId, guestName, roomNumber, service, serviceLabel || service, price || 0, bookingDate, bookingTime, notes || '', 'pending', new Date().toISOString()]
        );
        
        // Log for admin
        await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
            [null, `New spa booking by ${guestName} (${service}) for ${bookingDate} at ${bookingTime}`, new Date().toISOString()]);
        
        res.status(201).json({ message: 'Spa session booked successfully' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get Guest Spa Bookings
router.get('/spa-bookings', async (req: AuthRequest, res) => {
    try {
        const guestId = req.user?.uid;
        const [bookings] = await getPool().query('SELECT * FROM spa_bookings WHERE guestId = ? ORDER BY createdAt DESC', [guestId]);
        res.json(bookings);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- Concierge Message Endpoints ---

// Send Concierge Message
router.post('/concierge-messages', async (req: AuthRequest, res) => {
    try {
        const { message, roomNumber } = req.body;
        const guestId = req.user?.uid;
        
        if (!guestId || !message || !message.trim()) {
            return res.status(400).json({ error: 'Message content is required' });
        }
        
        const [users]: any = await getPool().query('SELECT displayName FROM users WHERE uid = ?', [guestId]);
        const guestName = users[0]?.displayName || 'Guest';
        
        await getPool().query(
            'INSERT INTO concierge_messages (guestId, guestName, roomNumber, message, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
            [guestId, guestName, roomNumber || '', message.trim(), 0, new Date().toISOString()]
        );
        
        // Log for admin
        await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
            [null, `Concierge message from ${guestName}${roomNumber ? ` (Room ${roomNumber})` : ''}: ${message.substring(0, 50)}...`, new Date().toISOString()]);
        
        res.status(201).json({ message: 'Message sent to concierge' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get Guest Concierge Messages
router.get('/concierge-messages', async (req: AuthRequest, res) => {
    try {
        const guestId = req.user?.uid;
        const [messages] = await getPool().query('SELECT * FROM concierge_messages WHERE guestId = ? ORDER BY createdAt DESC', [guestId]);
        res.json(messages);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get Receipt Data for a Reservation
router.get('/reservations/:id/receipt', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const guestId = req.user?.uid;

        // Fetch reservation with room details
        const [reservations]: any = await getPool().query(
            `SELECT r.*, rooms.type as roomType, rooms.pricePerNight
             FROM reservations r
             LEFT JOIN rooms ON r.roomId = rooms.id
             WHERE r.id = ? AND r.guestId = ?`,
            [id, guestId]
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

// Get All Scheduled Events
router.get('/events', async (req, res) => {
    try {
        const [events] = await getPool().query('SELECT * FROM events ORDER BY date ASC');
        res.json(events);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Request an Event (Guest)
router.post('/events', async (req: AuthRequest, res) => {
    try {
        const { title, description, date, location } = req.body;
        const guestId = req.user?.uid;
        
        if (!title || !date || !location) {
            return res.status(400).json({ error: 'Title, date, and location are required' });
        }
        
        const [users]: any = await getPool().query('SELECT displayName FROM users WHERE uid = ?', [guestId]);
        const guestName = users[0]?.displayName || 'Guest';

        await getPool().query(
            'INSERT INTO events (title, description, organizerId, organizerName, date, location, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description || '', guestId, guestName, date, location, 'pending_approval']
        );
        
        // Log action for admin overview
        await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
            [null, `New event request "${title}" submitted by ${guestName}`, new Date().toISOString()]);

        res.status(201).json({ message: 'Event request submitted successfully' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
