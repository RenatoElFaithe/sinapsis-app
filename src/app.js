import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import './db.js';

import clientesRoutes from './routes/clientes.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import { pool } from './db.js';

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
        const [clientesResult] = await pool.query('SELECT COUNT(*) AS totalClientes FROM clientes');
        const [pedidosResult] = await pool.query('SELECT COUNT(*) AS totalPedidos FROM pedidos');
        const [ingresosResult] = await pool.query('SELECT SUM(total) AS totalIngresos FROM pedidos');

        // ¡AQUÍ ESTÁ LA CORRECCIÓN!
        // Nos aseguramos de que totalIngresos sea un número usando parseFloat.
        // Si es null (porque no hay pedidos), se convierte en 0.
        const totalIngresos = parseFloat(ingresosResult[0].totalIngresos) || 0;

        res.render('index', { 
            title: 'Inicio', 
            page_name: 'inicio',
            totalClientes: clientesResult[0].totalClientes,
            totalPedidos: pedidosResult[0].totalPedidos,
            totalIngresos: totalIngresos 
        }); 
    } catch (error) {
        console.error("Error al cargar el dashboard:", error);
        res.status(500).send("Error al cargar la página de inicio");
    }
});

app.use(clientesRoutes);
app.use(pedidosRoutes);

// --- Iniciar el Servidor ---
app.listen(app.get('port'), () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${app.get('port')}`);
});