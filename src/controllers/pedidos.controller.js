import { pool } from '../db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Muestra todos los pedidos
export const renderPedidos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id, p.fecha_pedido, p.total, p.comprobante_img, c.nombre AS cliente_nombre
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            ORDER BY p.fecha_pedido DESC
        `);
        res.render('pedidos/list', { 
            pedidos: result.rows, 
            page_name: 'pedidos' // Para resaltar el link del menú
        });
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).send('Error al cargar los pedidos');
    }
};

// Muestra el formulario para crear un nuevo pedido
export const renderPedidoCreateForm = async (req, res) => {
    try {
        const clientesResult = await pool.query('SELECT id, nombre FROM clientes');
        res.render('pedidos/create', { 
            clientes: clientesResult.rows, 
            page_name: 'pedidos' // Para resaltar el link del menú
        });
    } catch (error) {
        console.error('Error al cargar formulario de pedido:', error);
        res.status(500).send('Error al cargar el formulario');
    }
};

// Guarda el nuevo pedido en la base de datos
export const createPedido = async (req, res) => {
    try {
        const { fecha_pedido, total, cliente_id } = req.body;
        const comprobante_img = req.file ? req.file.filename : null;
        
        await pool.query(
            'INSERT INTO pedidos (fecha_pedido, total, comprobante_img, cliente_id) VALUES ($1, $2, $3, $4)',
            [fecha_pedido, total, comprobante_img, cliente_id]
        );
        res.redirect('/pedidos');
    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).send('Error al crear el pedido');
    }
};

// Muestra el formulario para editar un pedido
export const renderPedidoEditForm = async (req, res) => {
    try {
        const { id } = req.params;
        const clientesResult = await pool.query('SELECT id, nombre FROM clientes');
        const pedidoResult = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
        
        if (pedidoResult.rows.length === 0) {
            return res.status(404).send('Pedido no encontrado');
        }

        const pedido = pedidoResult.rows[0];
        if (pedido) {
            pedido.fecha_formateada = new Date(pedido.fecha_pedido).toISOString().split('T')[0];
        }

        res.render('pedidos/edit', { 
            pedido: pedido, 
            clientes: clientesResult.rows, 
            page_name: 'pedidos' // Para resaltar el link del menú
        });
    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        res.status(500).send('Error al cargar el formulario de edición');
    }
};

// Actualiza el pedido en la base de datos
export const updatePedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_pedido, total, cliente_id } = req.body;

        const oldPedidoResult = await pool.query('SELECT comprobante_img FROM pedidos WHERE id = $1', [id]);
        const oldImage = oldPedidoResult.rows[0]?.comprobante_img;

        let newImage = oldImage;

        if (req.file) {
            newImage = req.file.filename;
            if (oldImage) {
                try {
                    await fs.unlink(path.join(__dirname, `../public/uploads/${oldImage}`));
                } catch (err) {
                    console.error("No se pudo eliminar la imagen antigua:", err);
                }
            }
        }
        
        await pool.query(
            'UPDATE pedidos SET fecha_pedido = $1, total = $2, cliente_id = $3, comprobante_img = $4 WHERE id = $5',
            [fecha_pedido, total, cliente_id, newImage, id]
        );

        res.redirect('/pedidos');
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        res.status(500).send('Error al actualizar el pedido');
    }
};

// Elimina un pedido de la base de datos
export const deletePedido = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('SELECT comprobante_img FROM pedidos WHERE id = $1', [id]);
        const imageName = result.rows[0]?.comprobante_img;
        
        if (imageName) {
            try {
                await fs.unlink(path.join(__dirname, `../public/uploads/${imageName}`));
            } catch (err) {
                console.error("No se pudo eliminar la imagen:", err);
            }
        }
        
        await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
        
        res.redirect('/pedidos');
    } catch (error) {
        console.error('Error al eliminar pedido:', error);
        res.status(500).send('Error al eliminar el pedido');
    }
};