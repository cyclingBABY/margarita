const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'magarite_db'
};

async function run() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to MySQL database.");

    const newPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update stuartdonsms@gmail.com
    const [res1] = await connection.execute(
      'UPDATE users SET passwordHash = ?, accountStatus = "Active" WHERE email = ?',
      [passwordHash, 'stuartdonsms@gmail.com']
    );
    console.log(`Updated stuartdonsms@gmail.com. Rows affected: ${res1.affectedRows}`);

    // Update testadmin@example.com
    const [res2] = await connection.execute(
      'UPDATE users SET passwordHash = ?, accountStatus = "Active" WHERE email = ?',
      [passwordHash, 'testadmin@example.com']
    );
    console.log(`Updated testadmin@example.com. Rows affected: ${res2.affectedRows}`);

    console.log(`\nSuccess! Both admin passwords have been reset to: ${newPassword}`);
  } catch (err) {
    console.error("Error setting admin password:", err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

run();
