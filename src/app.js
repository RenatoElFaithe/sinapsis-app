import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { pool, initDatabase } from './db.js';

config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Configuración
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal - ADAPTADA PARA POSTGRESQL
app.get('/', async (req, res) => {
  try {
    console.log('📊 Cargando dashboard desde PostgreSQL...');
    
    const clientesResult = await pool.query('SELECT COUNT(*) as total FROM clientes');
    const pedidosResult = await pool.query('SELECT COUNT(*) as total FROM pedidos');
    const ingresosResult = await pool.query('SELECT COALESCE(SUM(total), 0) as total FROM pedidos');

    res.render('index', {
      title: 'Inicio',
      page_name: 'inicio',
      totalClientes: parseInt(clientesResult.rows[0].total),
      totalPedidos: parseInt(pedidosResult.rows[0].total),
      totalIngresos: parseFloat(ingresosResult.rows[0].total)
    });
  } catch (error) {
    console.error('❌ Error en ruta principal:', error);
    // Renderizar con valores por defecto si hay error
    res.render('index', {
      title: 'Inicio',
      page_name: 'inicio',
      totalClientes: 0,
      totalPedidos: 0,
      totalIngresos: 0
    });
  }
});

// Importar rutas
import clientesRoutes from './routes/clientes.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';

app.use(clientesRoutes);
app.use(pedidosRoutes);

// Ruta para forzar inicialización de BD
app.get('/init-db', async (req, res) => {
  try {
    await initDatabase();
    res.json({ 
      success: true, 
      message: '✅ Base de datos PostgreSQL inicializada correctamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Ruta de salud
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      database: 'PostgreSQL conectado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'PostgreSQL no conectado',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Node.js con PostgreSQL corriendo en puerto ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🗃️ Init DB: http://localhost:${PORT}/init-db`);
  console.log(`🏠 App principal: http://localhost:${PORT}`);
});