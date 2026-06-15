import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Modular Routes
import { getPool } from './src/db/index.js';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import staffRoutes from './src/routes/staffRoutes.js';
import housekeepingRoutes from './src/routes/housekeepingRoutes.js';
import guestRoutes from './src/routes/guestRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  try {
    // 1. Initialize DB Pool
    const pool = getPool();
    // Run lightweight migrations
    try {
      await pool.query('ALTER TABLE feedback ADD COLUMN IF NOT EXISTS serviceType VARCHAR(50)');
      await pool.query('ALTER TABLE feedback ADD COLUMN IF NOT EXISTS serviceId VARCHAR(255)');
      await pool.query('ALTER TABLE room_service_orders ADD COLUMN IF NOT EXISTS paymentStatus VARCHAR(50) DEFAULT "pending"');
      await pool.query('ALTER TABLE spa_bookings ADD COLUMN IF NOT EXISTS paymentStatus VARCHAR(50) DEFAULT "pending"');
      await pool.query('ALTER TABLE reservations ADD COLUMN IF NOT EXISTS approvedBy VARCHAR(255)');
      await pool.query('ALTER TABLE reservations ADD COLUMN IF NOT EXISTS approvedAt VARCHAR(100)');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profilePicture VARCHAR(500)');
      console.log("Database migrations applied.");
    } catch (migrationErr: any) {
      // Columns may already exist; ignore errors
      console.log("Migration check complete (columns may already exist).");
    }
    console.log("Database pool initialized.");
  } catch (err: any) {
    console.warn("Could not connect to MySQL database:", err.message);
  }

  // --- API Routes (RBAC Enforced) ---
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/staff', staffRoutes);
  app.use('/api/housekeeping', housekeepingRoutes);
  app.use('/api/guest', guestRoutes);

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
