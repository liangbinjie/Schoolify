import express from "express";
import Course from '../db/models/courseModel.js';
import File from '../db/models/fileModel.js';
import Tab from "../db/models/tabModel.js";
import upload from '../middleware/upload.js';
import path from "path";
import fs from "fs";
import multer from "multer";

const tabsRouter = express.Router();

const memoryUpload = multer({ storage: multer.memoryStorage() });

// Obtener todos los tabs de un curso
tabsRouter.get("/courses/:courseId/tabs", async (req, res) => {
    try {
        // Buscar el curso y popular los tabs relacionados
        const course = await Course.findById(req.params.courseId).populate("tabs");

        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }

        // Verificar si el curso tiene tabs
        if (!course.tabs || course.tabs.length === 0) {
            return res.status(200).json([]);
        }

        // Ordenar los tabs por el campo `order` (si existe)
        const sortedTabs = course.tabs.sort((a, b) => a.order - b.order);

        res.status(200).json(sortedTabs);
    } catch (err) {
        console.error("Error al obtener los tabs:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Crear un nuevo tab
tabsRouter.post("/courses/:courseId/tabs", memoryUpload.array("contents"), async (req, res) => {
    try {
        const { title, description, order } = req.body;

        if (!title || order === undefined) {
            return res.status(400).json({ message: "Se requiere título y orden para el tab" });
        }

        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }

        // Procesar los archivos subidos
        const files = req.files.map((file) => ({
            type: "file",
            title: file.originalname,
            content: file.buffer.toString("base64"), // Guardar como base64 o en un sistema de almacenamiento
            fileType: file.mimetype,
        }));

        // Crear el nuevo tab
        const newTab = {
            title,
            description: description || "",
            order,
            contents: files,
        };

        course.tabs.push(newTab);
        await course.save();

        res.status(201).json({
            message: "Tab creado exitosamente",
            tab: newTab,
        });
    } catch (err) {
        console.error("Error al crear tab:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Actualizar un tab
tabsRouter.put("/courses/:courseId/tabs/:tabId", async (req, res) => {
    try {
        const { title, description, order } = req.body;
        
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }
        
        // Encontrar el tab a actualizar
        const tabId = course.tabs.find(tab => tab._id === req.params.tabId)?._id;
        if (!tab) {
            return res.status(404).json({ message: "Tab no encontrado" });
        }
        
        // Si cambia el orden, ajustar los demás tabs
        if (order !== undefined && order !== tab.order) {
            course.tabs.forEach(t => {
                if (t._id.toString() !== req.params.tabId) {
                    if (order > tab.order && t.order > tab.order && t.order <= order) {
                        t.order -= 1;
                    } else if (order < tab.order && t.order < tab.order && t.order >= order) {
                        t.order += 1;
                    }
                }
            });
            tab.order = order;
        }
        
        // Actualizar propiedades
        if (title) tab.title = title;
        if (description !== undefined) tab.description = description;
        
        await course.save();
        
        res.status(200).json({ 
            message: "Tab actualizado exitosamente", 
            tab 
        });
    } catch (err) {
        console.error("Error al actualizar tab:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Eliminar un tab
tabsRouter.delete("/courses/:courseId/tabs/:tabId", async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }
        
        // Encontrar el tab a eliminar
        const tab = course.tabs.id(req.params.tabId);
        if (!tab) {
            return res.status(404).json({ message: "Tab no encontrado" });
        }
        
        const deletedOrder = tab.order;
        
        // Eliminar el tab
        course.tabs.pull(req.params.tabId);
        
        // Reordenar los tabs restantes
        course.tabs.forEach(t => {
            if (t.order > deletedOrder) {
                t.order -= 1;
            }
        });
        
        await course.save();
        
        res.status(200).json({ message: "Tab eliminado exitosamente" });
    } catch (err) {
        console.error("Error al eliminar tab:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Agregar contenido de texto a un tab
tabsRouter.post("/courses/:courseId/tabs/:tabId/content/text", async (req, res) => {
    try {
        const { title, description, content, order } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ message: "Título y contenido son requeridos" });
        }
        
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }
        
        const tab = course.tabs.id(req.params.tabId);
        if (!tab) {
            return res.status(404).json({ message: "Tab no encontrado" });
        }
        
        // Crear nuevo contenido
        const newContent = {
            type: "text",
            title,
            description: description || "",
            content,
            order: order || tab.contents.length
        };
        
        tab.contents.push(newContent);
        await course.save();
        
        res.status(201).json({
            message: "Contenido de texto agregado exitosamente",
            content: newContent
        });
    } catch (err) {
        console.error("Error al agregar contenido de texto:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Subir un archivo (imagen, documento, video) a un tab
tabsRouter.post("/courses/:courseId/tabs/:tabId/content/file", upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se subió ningún archivo" });
        }
        
        const { title, description, type, order } = req.body;
        
        if (!title || !type) {
            return res.status(400).json({ message: "Título y tipo son requeridos" });
        }
        
        // Validar tipo de contenido
        const validTypes = ["image", "document", "video"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: "Tipo no válido. Debe ser 'image', 'document' o 'video'" });
        }
        
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }
        
        const tab = course.tabs.id(req.params.tabId);
        if (!tab) {
            return res.status(404).json({ message: "Tab no encontrado" });
        }
        
        console.log("Archivo subido:", req.file); // Añadido para debugging
        
        // Guardar información del archivo en la colección de archivos
        const fileInfo = new File({
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            fileType: path.extname(req.file.originalname).substring(1).toLowerCase(),
            mimeType: req.file.mimetype,
            size: req.file.size,
            courseId: req.params.courseId,
            uploadedBy: req.body.uploadedBy || "unknown"
        });
        
        const savedFile = await fileInfo.save();
        console.log("Archivo guardado en DB:", savedFile); // Añadido para debugging
        
        // Crear contenido para el tab
        const newContent = {
            type,
            title,
            description: description || "",
            content: `/api/files/${savedFile._id}`, // URL para acceder al archivo
            fileType: path.extname(req.file.originalname).substring(1).toLowerCase(),
            order: order ? parseInt(order) : tab.contents.length
        };
        
        tab.contents.push(newContent);
        await course.save();
        
        res.status(201).json({
            message: "Archivo subido exitosamente",
            content: newContent,
            file: savedFile
        });
    } catch (err) {
        console.error("Error al subir archivo:", err);
        res.status(500).json({ message: "Error interno del servidor", error: err.message });
    }
});

// Agregar un enlace a un tab
tabsRouter.post("/courses/:courseId/tabs/:tabId/content/link", async (req, res) => {
    try {
        const { title, description, url, order } = req.body;
        
        if (!title || !url) {
            return res.status(400).json({ message: "Título y URL son requeridos" });
        }
        
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }
        
        const tab = course.tabs.id(req.params.tabId);
        if (!tab) {
            return res.status(404).json({ message: "Tab no encontrado" });
        }
        
        // Crear nuevo contenido
        const newContent = {
            type: "link",
            title,
            description: description || "",
            content: url,
            order: order || tab.contents.length
        };
        
        tab.contents.push(newContent);
        await course.save();
        
        res.status(201).json({
            message: "Enlace agregado exitosamente",
            content: newContent
        });
    } catch (err) {
        console.error("Error al agregar enlace:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Eliminar contenido de un tab
tabsRouter.delete("/courses/:courseId/tabs/:tabId/content/:contentId", async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }
        
        const tab = course.tabs.id(req.params.tabId);
        if (!tab) {
            return res.status(404).json({ message: "Tab no encontrado" });
        }
        
        const content = tab.contents.id(req.params.contentId);
        if (!content) {
            return res.status(404).json({ message: "Contenido no encontrado" });
        }
        
        // Si es un archivo, eliminar de la colección de archivos y del sistema de archivos
        if (["image", "document", "video"].includes(content.type)) {
            // La URL del archivo tiene formato /api/files/:fileId
            const fileIdFromUrl = content.content.split('/').pop();
            
            // Buscar y eliminar el archivo
            const file = await File.findById(fileIdFromUrl);
            if (file) {
                // Eliminar físicamente el archivo
                fs.unlink(file.path, (err) => {
                    if (err) console.error("Error al eliminar archivo físico:", err);
                });
                
                // Eliminar de la base de datos
                await File.findByIdAndDelete(fileIdFromUrl);
            }
        }
        
        // Eliminar el contenido del tab
        tab.contents.pull(req.params.contentId);
        
        // Reordenar el contenido restante
        const deletedOrder = content.order;
        tab.contents.forEach(c => {
            if (c.order > deletedOrder) {
                c.order -= 1;
            }
        });
        
        await course.save();
        
        res.status(200).json({ message: "Contenido eliminado exitosamente" });
    } catch (err) {
        console.error("Error al eliminar contenido:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Crear un nuevo subtab (subtema)
tabsRouter.post(
    "/courses/:courseId/tabs/:tabId/subtabs",
    memoryUpload.none(), // Procesar datos de tipo multipart/form-data sin archivos
    async (req, res) => {
        try {
            console.log("Datos recibidos en req.body:", req.body);

            const { title, description, order } = req.body;

            const parentTab = await Tab.findById(req.params.tabId);
            if (!parentTab) {
                return res.status(404).json({ message: "Tab no encontrado" });
            }

            const newSubtab = {
                title,
                description: description || "",
                order,
            };

            parentTab.subtabs.push(newSubtab);
            await parentTab.save();

            res.status(201).json({
                message: "Subtema creado exitosamente",
                subtab: newSubtab,
            });
        } catch (err) {
            console.error("Error al crear subtema:", err);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
);

// Subir un archivo a un subtab
tabsRouter.post(
    "/courses/:courseId/tabs/:tabId/subtabs/:subtabId/content/file",
    memoryUpload.single("file"), // Procesar un archivo
    async (req, res) => {
        try {
            const { title, description, order } = req.body;

            if (!req.file) {
                return res.status(400).json({ message: "No se subió ningún archivo" });
            }

            const parentTab = await Tab.findById(req.params.tabId);
            if (!parentTab) {
                return res.status(404).json({ message: "Tab no encontrado" });
            }

            const subtab = parentTab.subtabs.id(req.params.subtabId);
            if (!subtab) {
                return res.status(404).json({ message: "Subtab no encontrado" });
            }

            const newContent = {
                type: "file",
                title: title || req.file.originalname,
                description: description || "",
                content: req.file.buffer.toString("base64"), // Guardar el archivo como base64
                fileType: req.file.mimetype,
                order: order || subtab.contents.length,
            };

            subtab.contents.push(newContent);
            await parentTab.save();

            res.status(201).json({
                message: "Archivo subido exitosamente al subtab",
                content: newContent,
            });
        } catch (err) {
            console.error("Error al subir archivo al subtab:", err);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
);

export default tabsRouter;