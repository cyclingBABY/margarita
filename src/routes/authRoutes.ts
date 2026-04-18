import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getPool } from '../db/index.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hotel_margarita_super_secret';

router.post('/register', async (req, res) => {
  let { 
    uid, email, displayName, role, phoneNumber, password, 
    dateOfBirth, nationality, idType, idNumber, 
    employeeId, department, emergencyContact, 
    ipAddress, deviceType, accountStatus, referralSource 
  } = req.body;
  
  if (!uid) {
    uid = crypto.randomUUID();
  }
  
  try {
    const pool = getPool();
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    await pool.query(`
      INSERT INTO users (
        uid, email, displayName, role, phoneNumber, passwordHash, 
        dateOfBirth, nationality, idType, idNumber, 
        employeeId, department, emergencyContact, 
        ipAddress, deviceType, accountStatus, referralSource, createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uid, email, displayName, role || 'guest', phoneNumber, passwordHash, 
      dateOfBirth, nationality, idType, idNumber, 
      employeeId, department, emergencyContact, 
      ipAddress, deviceType, accountStatus || 'Pending', referralSource, new Date().toISOString()
    ]);

    const token = jwt.sign({ uid, role: role || 'guest' }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ 
      message: 'User registered', 
      token, 
      user: { uid, email, displayName, role: role || 'guest' } 
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = getPool();
        const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            res.status(400).json({ error: 'User not found' });
            return;
        }
        
        const user = users[0];
        if (!user.passwordHash) {
            res.status(400).json({ error: 'User does not have a password set.' });
            return;
        }
        
        const validPass = await bcrypt.compare(password, user.passwordHash);
        if (!validPass) {
            res.status(400).json({ error: 'Invalid password' });
            return;
        }

        const token = jwt.sign({ uid: user.uid, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { uid: user.uid, role: user.role, displayName: user.displayName, email: user.email }});
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/google', async (req, res) => {
  const { uid, email, displayName } = req.body;
  try {
    const pool = getPool();
    const [existing]: any = await pool.query('SELECT * FROM users WHERE uid = ?', [uid]);
    if (existing.length === 0) {
      await pool.query(`
        INSERT INTO users (uid, email, displayName, role, accountStatus, createdAt)
        VALUES (?, ?, ?, 'guest', 'Active', ?)
      `, [uid, email, displayName, new Date().toISOString()]);
    }
    res.json({ message: 'Google user synced' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile/:uid', async (req, res) => {
  try {
    const pool = getPool();
    const [users]: any = await pool.query('SELECT uid, email, displayName, role, phoneNumber, dateOfBirth, nationality FROM users WHERE uid = ?', [req.params.uid]);
    if (users.length > 0) res.json(users[0]);
    else res.status(404).json({ error: 'User not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
