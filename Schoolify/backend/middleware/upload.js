import multer from "multer";
import path from "path";
import fs from "fs";

// Aseguramos que el directorio de uploads exista
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configura el almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const courseId = req.params.courseId || "shared";
        const courseDir = path.join(uploadDir, courseId);
        
        if (!fs.existsSync(courseDir)) {
            fs.mkdirSync(courseDir, { recursive: true });
        }
        
        cb(null, courseDir);
    },
    filename: function (req, file, cb) {
        // Crear un nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Acepta imágenes, documentos, videos y archivos comunes
    const allowedTypes = [
        // Imágenes
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        // Documentos
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        // Videos
        'video/mp4', 'video/mpeg', 'video/webm',
        // Audio
        'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

// Crea el middleware de multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB límite
    }
});

export default upload;