import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';

config();

export const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 3306, // El puerto por defecto de MySQL
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

try {
    await pool.query('SELECT 1');
    console.log('>>> Conexión a la base de datos exitosa ✅');
} catch (error) {
    console.error('>>> Error al conectar con la base de datos ❌:', error);
}
