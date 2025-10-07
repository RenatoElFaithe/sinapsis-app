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
            page_name: 'pedidos'
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
            page_name: 'pedidos'
        });
    } catch (error) {
        console.error('Error al cargar formulario de pedido:', error);
        res.status(500).send('Error al cargar el formulario');
    }
};

// Guarda el nuevo pedido en la base de datos - CORREGIDO y con VALIDACIÓN
export const createPedido = async (req, res) => {
    try {
        console.log('📝 Datos recibidos:', req.body);
        
        const { fecha_pedido, producto, cantidad, precio, cliente_id } = req.body;
        const comprobante_img = req.file ? req.file.filename : null;
        
        // --- 💡 CORRECCIÓN CLAVE: VALIDACIÓN DE CAMPOS REQUERIDOS ---
        // Previene el error 'null value in column "producto" violates not-null constraint'
        if (!producto || !cantidad || !precio) {
            console.error('❌ Falta uno o más campos requeridos (producto, cantidad, precio).');
            return res.status(400).send('Faltan campos requeridos para crear el pedido (producto, cantidad, precio).');
        }
        
        // Aseguramos que los valores numéricos sean válidos
        const numCantidad = parseFloat(cantidad);
        const numPrecio = parseFloat(precio);
        
        if (isNaN(numCantidad) || isNaN(numPrecio) || numCantidad <= 0 || numPrecio <= 0) {
            console.error('❌ Cantidad o Precio no son números válidos o son cero/negativos.');
            return res.status(400).send('Cantidad y precio deben ser números positivos válidos.');
        }
        // -----------------------------------------------------------------

        // Calcular total automáticamente
        const total = numCantidad * numPrecio;
        
        console.log('🔍 Valores a insertar:', { 
            fecha_pedido, producto, cantidad, precio, total, cliente_id, comprobante_img 
        });
        
        const result = await pool.query(
            `INSERT INTO pedidos 
             (fecha_pedido, producto, cantidad, precio, total, comprobante_img, cliente_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [fecha_pedido, producto, numCantidad, numPrecio, total, comprobante_img, cliente_id]
        );
        
        console.log('✅ Pedido creado exitosamente:', result.rows[0]);
        res.redirect('/pedidos');
    } catch (error) {
        console.error('❌ Error al crear pedido:', error);
        // Enviamos el mensaje de error completo al cliente para debug
        res.status(500).send('Error al crear el pedido: ' + error.message);
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
            page_name: 'pedidos'
        });
    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        res.status(500).send('Error al cargar el formulario de edición');
    }
};

// Actualiza el pedido en la base de datos - CORREGIDO y con VALIDACIÓN
export const updatePedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_pedido, producto, cantidad, precio, cliente_id } = req.body;

        // --- 💡 CORRECCIÓN CLAVE: VALIDACIÓN DE CAMPOS REQUERIDOS ---
        // Previene el error 'null value in column "producto" violates not-null constraint'
        if (!producto || !cantidad || !precio) {
            console.error('❌ Falta uno o más campos requeridos (producto, cantidad, precio) para actualizar.');
            return res.status(400).send('Faltan campos requeridos para actualizar el pedido (producto, cantidad, precio).');
        }
        
        const numCantidad = parseFloat(cantidad);
        const numPrecio = parseFloat(precio);
        
        if (isNaN(numCantidad) || isNaN(numPrecio) || numCantidad <= 0 || numPrecio <= 0) {
            console.error('❌ Cantidad o Precio no son números válidos o son cero/negativos.');
            return res.status(400).send('Cantidad y precio deben ser números positivos válidos para actualizar.');
        }
        // -----------------------------------------------------------------
        
        // Calcular total automáticamente
        const total = numCantidad * numPrecio;

        const oldPedidoResult = await pool.query('SELECT comprobante_img FROM pedidos WHERE id = $1', [id]);
        const oldImage = oldPedidoResult.rows[0]?.comprobante_img;

        let newImage = oldImage;

        if (req.file) {
            newImage = req.file.filename;
            if (oldImage) {
                try {
                    await fs.unlink(path.join(__dirname, `../public/uploads/${oldImage}`));
                } catch (err) {
                    // Si el archivo ya no existe, ignoramos el error, pero lo logeamos
                    if (err.code !== 'ENOENT') {
                        console.error("No se pudo eliminar la imagen antigua:", err);
                    }
                }
            }
        }
        
        await pool.query(
            `UPDATE pedidos SET 
             fecha_pedido = $1, producto = $2, cantidad = $3, precio = $4, total = $5, 
             cliente_id = $6, comprobante_img = $7 
             WHERE id = $8`,
            [fecha_pedido, producto, numCantidad, numPrecio, total, cliente_id, newImage, id]
        );

        res.redirect('/pedidos');
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        res.status(500).send('Error al actualizar el pedido: ' + error.message);
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
                if (err.code !== 'ENOENT') {
                    console.error("No se pudo eliminar la imagen:", err);
                }
            }
        }
        
        await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
        
        res.redirect('/pedidos');
    } catch (error) {
        console.error('Error al eliminar pedido:', error);
        res.status(500).send('Error al eliminar el pedido');
    }
};