import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('hotel.db');

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    displayName TEXT,
    role TEXT DEFAULT 'guest',
    phoneNumber TEXT,
    dateOfBirth TEXT,
    nationality TEXT,
    idType TEXT,
    idNumber TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT UNIQUE,
    type TEXT,
    status TEXT,
    pricePerNight REAL,
    description TEXT,
    floor INTEGER
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guestId TEXT,
    guestName TEXT,
    roomId INTEGER,
    roomNumber TEXT,
    checkInDate TEXT,
    checkOutDate TEXT,
    totalAmount REAL,
    status TEXT,
    paymentStatus TEXT,
    createdAt TEXT,
    FOREIGN KEY(guestId) REFERENCES users(uid),
    FOREIGN KEY(roomId) REFERENCES rooms(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId TEXT,
    receiverId TEXT,
    content TEXT,
    timestamp TEXT,
    read INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guestId TEXT,
    guestName TEXT,
    rating INTEGER,
    comment TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    organizerId TEXT,
    organizerName TEXT,
    date TEXT,
    location TEXT,
    status TEXT
  );
`);

// Seed initial rooms if empty
const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get() as { count: number };
if (roomCount.count === 0) {
  const insertRoom = db.prepare('INSERT INTO rooms (number, type, status, pricePerNight, floor) VALUES (?, ?, ?, ?, ?)');
  for (let i = 1; i <= 20; i++) {
    const floor = Math.floor((i - 1) / 5) + 1;
    const type = i % 5 === 0 ? 'suite' : i % 3 === 0 ? 'deluxe' : 'double';
    const price = type === 'suite' ? 500000 : type === 'deluxe' ? 300000 : 150000;
    insertRoom.run(`${floor}0${i % 5 || 5}`, type, 'available', price, floor);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // Users
  app.get('/api/users', (req, res) => {
    const users = db.prepare('SELECT * FROM users').all();
    res.json(users);
  });

  app.post('/api/users', (req, res) => {
    const { uid, email, displayName, role, phoneNumber, dateOfBirth, nationality, idType, idNumber } = req.body;
    try {
      const insert = db.prepare(`
        INSERT INTO users (uid, email, displayName, role, phoneNumber, dateOfBirth, nationality, idType, idNumber, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insert.run(uid, email, displayName, role || 'guest', phoneNumber, dateOfBirth, nationality, idType, idNumber, new Date().toISOString());
      res.status(201).json({ message: 'User created' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/users/:uid', (req, res) => {
    const { uid } = req.params;
    const { role } = req.body;
    db.prepare('UPDATE users SET role = ? WHERE uid = ?').run(role, uid);
    res.json({ message: 'User updated' });
  });

  // Rooms
  app.get('/api/rooms', (req, res) => {
    const rooms = db.prepare('SELECT * FROM rooms ORDER BY number ASC').all();
    res.json(rooms);
  });

  app.patch('/api/rooms/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare('UPDATE rooms SET status = ? WHERE id = ?').run(status, id);
    res.json({ message: 'Room updated' });
  });

  // Reservations
  app.get('/api/reservations', (req, res) => {
    const { guestId } = req.query;
    let reservations;
    if (guestId) {
      reservations = db.prepare('SELECT * FROM reservations WHERE guestId = ? ORDER BY createdAt DESC').all(guestId);
    } else {
      reservations = db.prepare('SELECT * FROM reservations ORDER BY createdAt DESC').all();
    }
    res.json(reservations);
  });

  app.post('/api/reservations', (req, res) => {
    const { guestId, guestName, roomId, roomNumber, checkInDate, checkOutDate, totalAmount } = req.body;
    const insert = db.prepare(`
      INSERT INTO reservations (guestId, guestName, roomId, roomNumber, checkInDate, checkOutDate, totalAmount, status, paymentStatus, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(guestId, guestName, roomId, roomNumber, checkInDate, checkOutDate, totalAmount, 'confirmed', 'pending', new Date().toISOString());
    res.status(201).json({ message: 'Reservation created' });
  });

  // Feedback
  app.get('/api/feedback', (req, res) => {
    const feedback = db.prepare('SELECT * FROM feedback ORDER BY createdAt DESC').all();
    res.json(feedback);
  });

  app.post('/api/feedback', (req, res) => {
    const { guestId, guestName, rating, comment } = req.body;
    const insert = db.prepare('INSERT INTO feedback (guestId, guestName, rating, comment, createdAt) VALUES (?, ?, ?, ?, ?)');
    insert.run(guestId, guestName, rating, comment, new Date().toISOString());
    res.status(201).json({ message: 'Feedback submitted' });
  });

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
