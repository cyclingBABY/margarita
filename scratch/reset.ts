import { getPool } from '../src/db/index.js';
import bcrypt from 'bcryptjs';

async function run() {
  try {
    console.log("Initializing pool...");
    const pool = getPool();
    const newPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    console.log("Executing query...");
    const [res] = await pool.query(
      'UPDATE users SET passwordHash = ?, accountStatus = "Active" WHERE email = ?',
      [passwordHash, 'stuartdonsms@gmail.com']
    );
    console.log("Update result:", res);
    console.log("Password reset successfully to admin123");
    process.exit(0);
  } catch (err) {
    console.error("Error resetting password:", err);
    process.exit(1);
  }
}

run();
