import { getPool } from '../src/db/index.js';

async function run() {
  try {
    console.log("Initializing pool...");
    const pool = getPool();
    console.log("Executing query...");
    const [res] = await pool.query('SELECT uid, email, displayName, role, accountStatus FROM users');
    console.log("Users in database:");
    console.log(res);
    process.exit(0);
  } catch (err) {
    console.error("Error running query:", err);
    process.exit(1);
  }
}

run();
