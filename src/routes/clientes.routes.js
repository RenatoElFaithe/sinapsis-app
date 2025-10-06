import { Router } from 'express';

import { 
    renderClientes, 
    renderClienteCreateForm, 
    createCliente, 
    renderClienteEditForm, 
    updateCliente, 
    deleteCliente 
} from '../controllers/clientes.controller.js';

const router = Router();

router.get('/clientes', renderClientes);

router.get('/clientes/create', renderClienteCreateForm);

router.post('/clientes/create', createCliente);

router.get('/clientes/edit/:id', renderClienteEditForm);
router.post('/clientes/edit/:id', updateCliente);

router.get('/clientes/delete/:id', deleteCliente);


export default router;