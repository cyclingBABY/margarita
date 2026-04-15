import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth.js';
import { getPool } from '../db/index.js';

const router = Router();
router.use(authenticateToken, authorizeRoles('admin'));

// Existing: Get all users
router.get('/users', async (req, res) => {
  try {
    const [users] = await getPool().query('SELECT * FROM users');
    res.json(users);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
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

export default router;
