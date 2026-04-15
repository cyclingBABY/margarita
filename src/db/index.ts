import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotel_db' // Default connection
};

let pool: mysql.Pool;

export const getPool = () => {
    if (!pool) {
        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    return pool;
};

// Also expose raw setup if we ever need it uninitialized
export const getDbConfig = () => dbConfig;
