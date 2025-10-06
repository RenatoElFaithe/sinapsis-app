import { pool } from '../db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Muestra todos los pedidos
export const renderPedidos = async (req, res) => {
    const [rows] = await pool.query(`
        SELECT p.id_pedido, p.fecha, p.total, p.comprobante_img, c.nombre AS cliente_nombre
        FROM pedidos p
        LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
        ORDER BY p.fecha DESC
    `);
    res.render('pedidos/list', { 
        pedidos: rows, 
        page_name: 'pedidos' // Para resaltar el link del menú
    });
};

// Muestra el formulario para crear un nuevo pedido
export const renderPedidoCreateForm = async (req, res) => {
    const [clientes] = await pool.query('SELECT id_cliente, nombre FROM clientes');
    res.render('pedidos/create', { 
        clientes: clientes, 
        page_name: 'pedidos' // Para resaltar el link del menú
    });
};

// Guarda el nuevo pedido en la base de datos
export const createPedido = async (req, res) => {
    const { fecha, total, id_cliente } = req.body;
    const comprobante_img = req.file ? req.file.filename : null;
    await pool.query(
        'INSERT INTO pedidos (fecha, total, comprobante_img, id_cliente) VALUES (?, ?, ?, ?)',
        [fecha, total, comprobante_img, id_cliente]
    );
    res.redirect('/pedidos');
};

// Muestra el formulario para editar un pedido
export const renderPedidoEditForm = async (req, res) => {
    const { id } = req.params;
    const [clientes] = await pool.query('SELECT id_cliente, nombre FROM clientes');
    const [result] = await pool.query('SELECT * FROM pedidos WHERE id_pedido = ?', [id]);
    
    const pedido = result[0];
    if (pedido) {
        pedido.fecha_formateada = new Date(pedido.fecha).toISOString().split('T')[0];
    }

    res.render('pedidos/edit', { 
        pedido: pedido, 
        clientes: clientes, 
        page_name: 'pedidos' // Para resaltar el link del menú
    });
};

// Actualiza el pedido en la base de datos
export const updatePedido = async (req, res) => {
    const { id } = req.params;
    const { fecha, total, id_cliente } = req.body;

    const [oldPedidoResult] = await pool.query('SELECT comprobante_img FROM pedidos WHERE id_pedido = ?', [id]);
    const oldImage = oldPedidoResult[0]?.comprobante_img;

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
        'UPDATE pedidos SET fecha = ?, total = ?, id_cliente = ?, comprobante_img = ? WHERE id_pedido = ?',
        [fecha, total, id_cliente, newImage, id]
    );

    res.redirect('/pedidos');
};

// Elimina un pedido de la base de datos
export const deletePedido = async (req, res) => {
    const { id } = req.params;

    const [result] = await pool.query('SELECT comprobante_img FROM pedidos WHERE id_pedido = ?', [id]);
    const imageName = result[0]?.comprobante_img;
    
    if (imageName) {
        try {
            await fs.unlink(path.join(__dirname, `../public/uploads/${imageName}`));
        } catch (err) {
            console.error("No se pudo eliminar la imagen:", err);
        }
    }
    
    await pool.query('DELETE FROM pedidos WHERE id_pedido = ?', [id]);
    
    res.redirect('/pedidos');
};
