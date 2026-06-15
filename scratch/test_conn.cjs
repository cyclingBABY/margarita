const mysql = require('mysql2/promise');

async function test(host) {
  console.log(`Testing connection to ${host}...`);
  try {
    const conn = await mysql.createConnection({
      host: host,
      user: 'root',
      password: '',
      connectTimeout: 2000
    });
    console.log(`Success connecting to ${host}!`);
    const [rows] = await conn.execute('SHOW DATABASES');
    console.log('Databases:', rows);
    await conn.end();
  } catch (err) {
    console.error(`Failed connecting to ${host}:`, err.message);
  }
}

async function run() {
  await test('192.168.10.254');
  await test('127.0.0.1');
  await test('localhost');
  await test('::1');
}

run();
