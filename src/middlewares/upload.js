import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenemos la ruta del directorio actual para que funcione en cualquier sistema operativo
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    // 1. Dónde se guardarán los archivos
    destination: path.join(__dirname, '../public/uploads'),

    // 2. Cómo se llamará el archivo
    filename: (req, file, cb) => {
        // Generamos un nombre único usando la fecha actual y el nombre original del archivo
        // para evitar que se sobreescriban archivos con el mismo nombre.
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

// Creamos el middleware de subida y le decimos que solo aceptará un archivo (`.single`)
// que venga de un input en el formulario con el name="comprobante_img"
export const upload = multer({
    storage: storage
}).single('comprobante_img');