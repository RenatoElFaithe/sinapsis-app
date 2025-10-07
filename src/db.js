import pkg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pkg;

console.log('🔧 Configurando conexión a PostgreSQL...');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false 
  }
});

// Función para inicializar tablas
export async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Inicializando tablas de PostgreSQL...');
    
    // Tabla clientes
    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        direccion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Tabla pedidos  
    await client.query(`
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
    
    console.log('✅ Tablas de PostgreSQL creadas/verificadas exitosamente');
  } catch (error) {
    console.error('❌ Error creando tablas en PostgreSQL:', error);
  } finally {
    client.release();
  }
}

// Probar conexión e inicializar
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Conexión a PostgreSQL exitosa');
    initDatabase();
  })
  .catch(err => {
    console.error('❌ Error conectando a PostgreSQL:', err);
  });