const bcrypt = require('bcryptjs');

const hashes = {
  stuart: '$2b$10$/kqIJ3hnf2vdQfsEMI0i7emohVSsHLBXartRYc46wUvAQnI5EdHuK',
  testadmin: '$2b$10$tmlPw7X9uy2XaxltcETq9e57BOQlsYRWShM4vAXnTw1rsyzxTHk6i',
  testadmin2: '$2b$10$n3kd0rzdmwTawuCLQYIwXOhCYlfSsnubQLVudmjtvKyOdiF07Pao.'
};

const commonPasswords = [
  'admin',
  'admin123',
  'password',
  'password123',
  '123456',
  '12345678',
  'stuart',
  'stuart123',
  'stuartadmin',
  'stuartdonsms',
  'margarita',
  'hotel',
  'Tropical2025!',
  'Nakibuule',
  'Kirabo',
  'Cycling',
  'Baby',
  'test',
  'testadmin',
  'testadmin123',
  'testadmin2',
  'testadmin2123'
];

async function run() {
  for (const [name, hash] of Object.entries(hashes)) {
    console.log(`Checking password for ${name}...`);
    for (const pw of commonPasswords) {
      const match = await bcrypt.compare(pw, hash);
      if (match) {
        console.log(`  FOUND MATCH: Password for ${name} is "${pw}"`);
      }
    }
  }
  console.log("Done checking.");
}

run();
