import pkg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necesario para Render
});

try {
  const res = await pool.query('SELECT 1');
  console.log('>>> Conexión a la base de datos exitosa ✅');
} catch (error) {
  console.error('>>> Error al conectar con la base de datos ❌:', error);
}
