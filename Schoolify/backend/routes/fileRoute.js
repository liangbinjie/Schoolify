import express from "express";
import File from '../db/models/fileModel.js';
import path from "path";
import fs from "fs";

const fileRouter = express.Router();

// Obtener un archivo por su ID
fileRouter.get("/:id", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        
        if (!file) {
            return res.status(404).json({ message: "Archivo no encontrado" });
        }
        
        // Verificar que el archivo existe físicamente
        if (!fs.existsSync(file.path)) {
            return res.status(404).json({ 
                message: "Archivo físico no encontrado en el servidor",
                path: file.path
            });
        }
        
        // Configurar cabeceras según el tipo de archivo
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
        
        // Enviar el archivo
        res.sendFile(path.resolve(file.path));
    } catch (err) {
        console.error("Error al obtener archivo:", err);
        res.status(500).json({ message: "Error interno del servidor", error: err.message });
    }
});

// Obtener información de un archivo sin descargarlo
fileRouter.get("/:id/info", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        
        if (!file) {
            return res.status(404).json({ message: "Archivo no encontrado" });
        }
        
        res.status(200).json({
            ...file.toObject(),
            exists: fs.existsSync(file.path)
        });
    } catch (err) {
        console.error("Error al obtener información del archivo:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Ruta para descargar un archivo (forzar descarga en lugar de visualización)
fileRouter.get("/:id/download", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        
        if (!file) {
            return res.status(404).json({ message: "Archivo no encontrado" });
        }
        
        // Verificar que el archivo existe físicamente
        if (!fs.existsSync(file.path)) {
            return res.status(404).json({ message: "Archivo físico no encontrado en el servidor" });
        }
        
        // Forzar descarga
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        
        // Enviar el archivo
        res.download(path.resolve(file.path), file.originalName);
    } catch (err) {
        console.error("Error al descargar archivo:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

export default fileRouter;