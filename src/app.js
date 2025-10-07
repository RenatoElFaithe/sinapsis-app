import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { pool, initDatabase } from './db.js'; // Importación corregida

config(); 
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views')); 
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Rutas ---
app.get('/', async (req, res) => {
    try {
        // CONSULTAS ADAPTADAS PARA POSTGRESQL
        const clientesResult = await pool.query('SELECT COUNT(*) AS "totalClientes" FROM clientes');
        const pedidosResult = await pool.query('SELECT COUNT(*) AS "totalPedidos" FROM pedidos');
        const ingresosResult = await pool.query('SELECT SUM(total) AS "totalIngresos" FROM pedidos');

        // PostgreSQL devuelve los resultados en result.rows
        const totalClientes = parseInt(clientesResult.rows[0].totalClientes) || 0;
        const totalPedidos = parseInt(pedidosResult.rows[0].totalPedidos) || 0;
        const totalIngresos = parseFloat(ingresosResult.rows[0].totalIngresos) || 0;

        res.render('index', { 
            title: 'Inicio', 
            page_name: 'inicio',
            totalClientes: totalClientes,
            totalPedidos: totalPedidos,
            totalIngresos: totalIngresos 
        }); 
    } catch (error) {
        console.error("Error al cargar el dashboard:", error);
        res.status(500).send("Error al cargar la página de inicio");
    }
});

// Importar rutas (asegúrate de que también estén adaptadas para PostgreSQL)
import clientesRoutes from './routes/clientes.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';

app.use(clientesRoutes);
app.use(pedidosRoutes);

// Ruta para inicializar BD manualmente si es necesario
app.get('/init-db', async (req, res) => {
    try {
        await initDatabase();
        res.json({ message: 'Base de datos inicializada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Iniciar el Servidor ---
app.listen(app.get('port'), () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${app.get('port')}`);
});