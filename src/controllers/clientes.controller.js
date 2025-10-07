import { pool } from '../db.js';

// Muestra todos los clientes
export const renderClientes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY nombre ASC');
        res.render('clientes/list', { 
            clientes: result.rows, 
            page_name: 'clientes' // Para resaltar el link del menú
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).send('Error al cargar los clientes');
    }
};

// Muestra el formulario para crear un nuevo cliente
export const renderClienteCreateForm = (req, res) => {
    res.render('clientes/create', { 
        page_name: 'clientes' // Para resaltar el link del menú
    });
};

// Guarda el nuevo cliente en la base de datos
export const createCliente = async (req, res) => {
    try {
        const { nombre, telefono, email } = req.body;
        await pool.query(
            'INSERT INTO clientes (nombre, telefono, email) VALUES ($1, $2, $3)', 
            [nombre, telefono, email]
        );
        res.redirect('/clientes');
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).send('Error al crear el cliente');
    }
};

// Muestra el formulario para editar un cliente
export const renderClienteEditForm = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).send('Cliente no encontrado');
        }
        
        res.render('clientes/edit', { 
            cliente: result.rows[0], 
            page_name: 'clientes' // Para resaltar el link del menú
        });
    } catch (error) {
        console.error('Error al obtener cliente para editar:', error);
        res.status(500).send('Error al cargar el formulario de edición');
    }
};

// Actualiza el cliente en la base de datos
export const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, telefono, email } = req.body;
        await pool.query(
            'UPDATE clientes SET nombre = $1, telefono = $2, email = $3 WHERE id = $4', 
            [nombre, telefono, email, id]
        );
        res.redirect('/clientes');
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).send('Error al actualizar el cliente');
    }
};

// Elimina un cliente de la base de datos
export const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
        res.redirect('/clientes');
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).send('Error al eliminar el cliente');
    }
};