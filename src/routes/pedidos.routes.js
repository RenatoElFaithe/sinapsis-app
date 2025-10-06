import { Router } from 'express';
import { upload } from '../middlewares/upload.js';

// ¡Ahora importamos las nuevas funciones que crearemos!
import { 
    renderPedidos,
    renderPedidoCreateForm,
    createPedido,
    renderPedidoEditForm, // <--- NUEVO
    updatePedido,         // <--- NUEVO
    deletePedido          // <--- NUEVO
} from '../controllers/pedidos.controller.js';

const router = Router();

// --- Rutas de Lectura y Creación (Ya las teníamos) ---
router.get('/pedidos', renderPedidos);
router.get('/pedidos/create', renderPedidoCreateForm);
router.post('/pedidos/create', upload, createPedido);

// --- NUEVO: Rutas para Actualizar un Pedido ---
// Muestra el formulario para editar un pedido
router.get('/pedidos/edit/:id', renderPedidoEditForm); 
// Recibe los datos del formulario (y posible nueva imagen) para actualizar
router.post('/pedidos/edit/:id', upload, updatePedido); 

// --- NUEVO: Ruta para Eliminar un Pedido ---
router.get('/pedidos/delete/:id', deletePedido);


export default router;  