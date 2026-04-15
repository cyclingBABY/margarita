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

  try {
    // 1. Initialize DB Pool
    const pool = getPool();
    // In a real application, database creation logic and schema would be handled 
    // externally via migrations or an initialization script rather than on server boot.
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
