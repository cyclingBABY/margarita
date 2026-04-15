import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { getPool } from '../db/index.js';

const router = Router();
router.use(authenticateToken, authorizeRoles('admin', 'receptionist', 'manager'));

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

export default router;
