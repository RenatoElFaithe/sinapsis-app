import pkg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necesario para Render
});

// Función para inicializar la base de datos (CREAR TABLAS)
export async function initDatabase() {
    try {
        // Crear tabla clientes
        await pool.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                telefono VARCHAR(20),
                direccion TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Crear tabla pedidos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pedidos (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER REFERENCES clientes(id),
                producto VARCHAR(200) NOT NULL,
                cantidad INTEGER NOT NULL,
                precio DECIMAL(10,2) NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                estado VARCHAR(50) DEFAULT 'pendiente',
                fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ Tablas verificadas/creadas en PostgreSQL');
    } catch (error) {
        console.error('❌ Error al inicializar tablas:', error);
    }
}

// Verificar conexión
try {
  const res = await pool.query('SELECT 1');
  console.log('>>> Conexión a la base de datos exitosa ✅');
  
  // Inicializar tablas después de conectar
  await initDatabase();
} catch (error) {
  console.error('>>> Error al conectar con la base de datos ❌:', error);
}