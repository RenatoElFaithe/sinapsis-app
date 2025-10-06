    import { pool } from '../db.js';

    // Muestra todos los clientes
    export const renderClientes = async (req, res) => {
        const [rows] = await pool.query('SELECT * FROM clientes ORDER BY nombre ASC');
        res.render('clientes/list', { 
            clientes: rows, 
            page_name: 'clientes' // Para resaltar el link del menú
        });
    };

    // Muestra el formulario para crear un nuevo cliente
    export const renderClienteCreateForm = (req, res) => {
        res.render('clientes/create', { 
            page_name: 'clientes' // Para resaltar el link del menú
        });
    };

    // Guarda el nuevo cliente en la base de datos
    export const createCliente = async (req, res) => {
        const { nombre, telefono, email } = req.body;
        await pool.query('INSERT INTO clientes (nombre, telefono, email) VALUES (?, ?, ?)', [nombre, telefono, email]);
        res.redirect('/clientes');
    };

    // Muestra el formulario para editar un cliente
    export const renderClienteEditForm = async (req, res) => {
        const { id } = req.params;
        const [result] = await pool.query('SELECT * FROM clientes WHERE id_cliente = ?', [id]);
        res.render('clientes/edit', { 
            cliente: result[0], 
            page_name: 'clientes' // Para resaltar el link del menú
        });
    };

    // Actualiza el cliente en la base de datos
    export const updateCliente = async (req, res) => {
        const { id } = req.params;
        const { nombre, telefono, email } = req.body;
        await pool.query('UPDATE clientes SET nombre = ?, telefono = ?, email = ? WHERE id_cliente = ?', [nombre, telefono, email, id]);
        res.redirect('/clientes');
    };

    // Elimina un cliente de la base de datos
    export const deleteCliente = async (req, res) => {
        const { id } = req.params;
        await pool.query('DELETE FROM clientes WHERE id_cliente = ?', [id]);
        res.redirect('/clientes');
    };
