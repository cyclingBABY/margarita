import { Router } from 'express';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth.js';
import { getPool } from '../db/index.js';

const router = Router();
router.use(authenticateToken, authorizeRoles('admin', 'receptionist', 'manager', 'housekeeping'));

// Existing: Get all rooms (Managers & Housekeeping need this)
router.get('/rooms', async (req, res) => {
  try {
    const [rooms] = await getPool().query('SELECT * FROM rooms ORDER BY number ASC');
    res.json(rooms);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Existing: Update Room Status
router.patch('/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await getPool().query('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Room updated' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Create Maintenance Report
router.post('/maintenance', async (req: AuthRequest, res) => {
    try {
        const { roomId, issue } = req.body;
        const reportedBy = req.user?.uid;
        await getPool().query('INSERT INTO maintenance_reports (roomId, reportedBy, issue, status, createdAt) VALUES (?, ?, ?, ?, ?)',
            [roomId, reportedBy, issue, 'open', new Date().toISOString()]);
        res.status(201).json({ message: "Maintenance report submitted successfully." });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// View Inventory
router.get('/inventory', async (req, res) => {
    try {
        const [inventory] = await getPool().query('SELECT * FROM inventory');
        res.json(inventory);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Update Inventory quantity
router.post('/inventory', async (req, res) => {
    try {
        const { itemName, quantityAdded } = req.body;
        // Using upsert or update. Since simple, let's just attempt insert and fallback to update.
        await getPool().query(`
            INSERT INTO inventory (itemName, quantity, lastUpdated) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE quantity = quantity + ?, lastUpdated = ?
        `, [itemName, quantityAdded, new Date().toISOString(), quantityAdded, new Date().toISOString()]);
        res.status(201).json({ message: "Inventory updated successfully." });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
