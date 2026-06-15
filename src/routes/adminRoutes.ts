import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth.js';
import { getPool } from '../db/index.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = Router();
router.use(authenticateToken, authorizeRoles('admin'));

// Get all users (exclude sensitive fields: passwordHash, ipAddress, deviceType, idNumber, emergencyContact)
router.get('/users', async (req, res) => {
  try {
    const [users] = await getPool().query(`
      SELECT uid, email, displayName, role, phoneNumber, dateOfBirth, nationality, 
             idType, employeeId, department, accountStatus, referralSource, createdAt 
      FROM users
    `);
    res.json(users);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Add new user (admin only)
router.post('/users', async (req: AuthRequest, res) => {
  try {
    const { 
      email, displayName, role, phoneNumber, password, 
      dateOfBirth, nationality, idType, idNumber, 
      employeeId, department, emergencyContact, accountStatus
    } = req.body;
    
    if (!email || !displayName || !password || !role) {
      return res.status(400).json({ error: 'Email, display name, password, and role are required' });
    }
    
    const pool = getPool();
    
    // Check if user already exists
    const [existing]: any = await pool.query('SELECT uid FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const uid = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    
    await pool.query(`
      INSERT INTO users (
        uid, email, displayName, role, phoneNumber, passwordHash, 
        dateOfBirth, nationality, idType, idNumber, 
        employeeId, department, emergencyContact, 
        accountStatus, createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uid, email, displayName, role, phoneNumber || null, passwordHash, 
      dateOfBirth || null, nationality || null, idType || null, idNumber || null, 
      employeeId || null, department || null, emergencyContact || null, 
      accountStatus || 'Active', new Date().toISOString()
    ]);

    // Log admin action
    const adminId = req.user?.uid;
    await pool.query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
      [adminId, `Created user ${email} (${displayName}) with role ${role}`, new Date().toISOString()]);

    res.status(201).json({ 
      message: 'User created successfully', 
      user: { uid, email, displayName, role } 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Existing: Update user role
router.patch('/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;
    await getPool().query('UPDATE users SET role = ? WHERE uid = ?', [role, uid]);

    // Log admin action
    const adminId = (req as AuthRequest).user?.uid;
    await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
      [adminId, `Changed user ${uid} role to ${role}`, new Date().toISOString()]);

    res.json({ message: 'User role updated' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Delete user (admin only)
router.delete('/users/:uid', async (req: AuthRequest, res) => {
  try {
    const { uid } = req.params;
    const pool = getPool();
    
    // Get user details first to log them
    const [userRes]: any = await pool.query('SELECT email, displayName FROM users WHERE uid = ?', [uid]);
    if (userRes.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { email, displayName } = userRes[0];

    await pool.query('DELETE FROM users WHERE uid = ?', [uid]);

    // Log admin action
    const adminId = req.user?.uid;
    await pool.query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
      [adminId, `Deleted user ${email} (${displayName})`, new Date().toISOString()]);

    res.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Financial Reports Logic
router.get('/reports/financial', async (req, res) => {
  try {
    const [revenueRes]: any = await getPool().query('SELECT SUM(amount) as totalRevenue FROM invoices WHERE status = "paid"');
    const [pendingRes]: any = await getPool().query('SELECT SUM(amount) as pendingRevenue FROM invoices WHERE status = "unpaid"');
    res.json({
      totalRevenueCollected: revenueRes[0].totalRevenue || 0,
      pendingRevenue: pendingRes[0].pendingRevenue || 0
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Pricing Rules Logic
router.post('/pricing', async (req, res) => {
  try {
    const { roomType, multiplier, startDate, endDate, description } = req.body;
    await getPool().query('INSERT INTO pricing_rules (roomType, multiplier, startDate, endDate, description) VALUES (?, ?, ?, ?, ?)',
      [roomType, multiplier, startDate, endDate, description]);
    res.json({ message: "Pricing rule created successfully" });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Promotions Logic
router.post('/promotions', async (req, res) => {
  try {
    const { code, discountPercent, activeFrom, activeTo } = req.body;
    await getPool().query('INSERT INTO promotions (code, discountPercent, activeFrom, activeTo) VALUES (?, ?, ?, ?)',
      [code, discountPercent, activeFrom, activeTo]);
    res.json({ message: "Promotion created successfully" });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// System Integrations Config (Settings mock)
router.post('/integrations/payment', async (req: AuthRequest, res) => {
  try {
    const adminId = req.user?.uid;
    await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
      [adminId, `Updated Payment Gateway Configuration`, new Date().toISOString()]);
    res.json({ message: "Payment integration configuration saved safely." })
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get System Logs
router.get('/logs', async (req, res) => {
  try {
    const [logs] = await getPool().query('SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(logs);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- Messaging Endpoints ---

// Get all conversations overview (latest message per non-admin sender)
router.get('/messages', async (req: AuthRequest, res) => {
  try {
    const adminId = req.user?.uid;
    const [rows]: any = await getPool().query(`
      SELECT m.*, u.displayName as senderName 
      FROM messages m
      LEFT JOIN users u ON m.senderId = u.uid
      WHERE m.id IN (
        SELECT MAX(id) FROM messages 
        WHERE senderId != ?
        GROUP BY senderId
      )
      ORDER BY m.timestamp DESC
    `, [adminId]);
    res.json(rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get conversation thread with specific guest
router.get('/messages/:guestId', async (req, res) => {
  try {
    const { guestId } = req.params;
    const [messages] = await getPool().query(
      'SELECT * FROM messages WHERE senderId = ? OR receiverId = ? ORDER BY timestamp ASC',
      [guestId, guestId]
    );
    res.json(messages);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin sends reply to guest
router.post('/messages', async (req: AuthRequest, res) => {
  try {
    const { guestId, content } = req.body;
    const adminId = req.user?.uid;
    if (!guestId || !content || !content.trim()) {
      return res.status(400).json({ error: 'Guest ID and content are required.' });
    }
    await getPool().query(
      'INSERT INTO messages (senderId, receiverId, content, timestamp, readStatus) VALUES (?, ?, ?, ?, ?)',
      [adminId, guestId, content.trim(), new Date().toISOString(), 0]
    );
    res.status(201).json({ message: 'Reply sent successfully.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Mark Message as Read
router.patch('/messages/:id/read', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.uid;
    await getPool().query(
      'UPDATE messages SET readStatus = 1 WHERE id = ? AND receiverId = ?',
      [id, adminId]
    );
    res.json({ message: "Message marked as read." });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get all guest feedback
router.get('/feedback', async (req, res) => {
  try {
    const [feedback] = await getPool().query(
      'SELECT f.*, u.displayName as guestDisplayName FROM feedback f LEFT JOIN users u ON f.guestId = u.uid ORDER BY f.createdAt DESC LIMIT 100'
    );
    res.json(feedback);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Get All Events (Admin)
router.get('/events', async (req, res) => {
  try {
    const [events] = await getPool().query('SELECT * FROM events ORDER BY date ASC');
    res.json(events);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Schedule Event (Admin)
router.post('/events', async (req: AuthRequest, res) => {
  try {
    const { title, description, date, location } = req.body;
    const adminId = req.user?.uid;
    
    if (!title || !date || !location) {
      return res.status(400).json({ error: 'Title, date, and location are required' });
    }

    const [users]: any = await getPool().query('SELECT displayName FROM users WHERE uid = ?', [adminId]);
    const adminName = users[0]?.displayName || 'Admin';

    await getPool().query(
      'INSERT INTO events (title, description, organizerId, organizerName, date, location, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description || '', adminId, adminName, date, location, 'scheduled']
    );

    // Log admin action
    await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
      [adminId, `Scheduled event: "${title}" on ${date} at ${location}`, new Date().toISOString()]);

    res.status(201).json({ message: 'Event scheduled successfully' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update Event Status (Approve / Reject)
router.patch('/events/:id/status', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'scheduled' or 'cancelled'
    const adminId = req.user?.uid;

    if (!status || !['scheduled', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [eventRes]: any = await getPool().query('SELECT title, organizerName FROM events WHERE id = ?', [id]);
    if (eventRes.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const { title, organizerName } = eventRes[0];

    await getPool().query('UPDATE events SET status = ? WHERE id = ?', [status, id]);

    // Log admin action
    const logAction = status === 'scheduled' 
      ? `Approved event "${title}" requested by ${organizerName}`
      : `Rejected event "${title}" requested by ${organizerName}`;

    await getPool().query('INSERT INTO system_logs (adminId, action, timestamp) VALUES (?, ?, ?)',
      [adminId, logAction, new Date().toISOString()]);

    res.json({ message: `Event status updated to ${status}` });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
