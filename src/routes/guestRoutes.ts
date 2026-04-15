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
router.use(authenticateToken, authorizeRoles('guest', 'admin', 'receptionist'));

// Guest Booking
router.post('/book', async (req: AuthRequest, res) => {
    try {
        const { roomId, roomNumber, checkInDate, checkOutDate, totalAmount } = req.body;
        // User ID injected from the AuthToken:
        const guestId = req.user?.uid;
        
        await getPool().query(`
          INSERT INTO reservations (guestId, guestName, roomId, roomNumber, checkInDate, checkOutDate, totalAmount, status, paymentStatus, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [guestId, 'Self-Booked', roomId, roomNumber, checkInDate, checkOutDate, totalAmount, 'confirmed', 'pending', new Date().toISOString()]);
        res.status(201).json({ message: 'Room booked successfully' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Guest Submitting Feedback
router.post('/feedback', async (req: AuthRequest, res) => {
    try {
      const { rating, comment } = req.body;
      const guestId = req.user?.uid;
      await getPool().query('INSERT INTO feedback (guestId, guestName, rating, comment, createdAt) VALUES (?, ?, ?, ?, ?)', 
        [guestId, 'Guest', rating, comment, new Date().toISOString()]);
      res.status(201).json({ message: 'Feedback submitted' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
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

export default router;
