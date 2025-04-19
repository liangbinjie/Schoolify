import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import CassandraFile from '../db/models/cassandraFileModel.js';
import { initCassandra, checkCassandraCluster } from '../db/cassandra.js';

const cassandraFileRouter = express.Router();

// Configuración de multer para almacenar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // Límite de 50MB
});

// Función para verificar la conexión al clúster
async function verifyConnection() {
  const clusterInfo = await checkCassandraCluster();
  console.log('Estado de la conexión:', clusterInfo.connected);
  console.log('Número total de nodos:', clusterInfo.totalNodes);

  // Añadir información sobre el datacenter (nombre del clúster)
  if (clusterInfo.connected && clusterInfo.localNode) {
    console.log('Datacenter del nodo local:', clusterInfo.localNode.data_center);
    
    // Mostrar todos los datacenters en el clúster
    const datacenters = new Set();
    datacenters.add(clusterInfo.localNode.data_center);
    
    if (clusterInfo.peerNodes && clusterInfo.peerNodes.length > 0) {
      clusterInfo.peerNodes.forEach(peer => {
        if (peer.data_center) {
          datacenters.add(peer.data_center);
        }
      });
    }
    
    console.log('Datacenters en el clúster:', Array.from(datacenters).join(', '));
  }
  
  return clusterInfo;
}

// Verificar conexión al inicializar el router
verifyConnection().then(info => {
  console.log('Verificación inicial del clúster completada');
  if (!info.connected) {
    console.error('⚠️ ADVERTENCIA: No se pudo conectar correctamente al clúster de Cassandra');
  }
}).catch(err => {
  console.error('Error al verificar conexión inicial:', err);
});

// Middleware que se asegura de que Cassandra esté inicializada antes de procesar cualquier solicitud
cassandraFileRouter.use(async (req, res, next) => {
  try {
    await initCassandra();
    next();
  } catch (err) {
    console.error('Error en middleware de Cassandra:', err);
    res.status(500).json({ message: 'Error al conectar con la base de datos' });
  }
});

// Ruta para subir un archivo a un tema
cassandraFileRouter.post('/upload/topic/:courseId/:topicId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }
    
    const { courseId, topicId } = req.params;
    const { title, description, uploadedBy } = req.body;
    
    const fileData = {
      courseId,
      topicId,
      filename: title || req.file.originalname,
      originalName: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      uploadedBy: uploadedBy || 'unknown'
    };
    
    const savedFile = await CassandraFile.saveFile(fileData);
    
    res.status(201).json({
      message: 'Archivo subido exitosamente',
      file: {
        id: savedFile.id,
        filename: savedFile.filename,
        originalName: savedFile.originalName,
        contentType: savedFile.contentType,
        size: savedFile.size
      }
    });
  } catch (err) {
    console.error('Error al subir archivo:', err);
    res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
  }
});

// Ruta para subir un archivo a un subtema
cassandraFileRouter.post('/upload/subtopic/:courseId/:topicId/:subtopicId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }
    
    const { courseId, topicId, subtopicId } = req.params;
    const { title, description, uploadedBy } = req.body;
    
    const fileData = {
      courseId,
      topicId,
      subtopicId,
      filename: title || req.file.originalname,
      originalName: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      uploadedBy: uploadedBy || 'unknown'
    };
    
    const savedFile = await CassandraFile.saveFile(fileData);
    
    res.status(201).json({
      message: 'Archivo subido exitosamente',
      file: {
        id: savedFile.id,
        filename: savedFile.filename,
        originalName: savedFile.originalName,
        contentType: savedFile.contentType,
        size: savedFile.size
      }
    });
  } catch (err) {
    console.error('Error al subir archivo:', err);
    res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
  }
});

// Ruta para obtener un archivo por su ID
cassandraFileRouter.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await CassandraFile.getFileById(fileId);
    
    if (!file) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    
    res.set('Content-Type', file.content_type);
    res.set('Content-Disposition', `inline; filename="${file.original_name}"`);
    res.send(file.data);
  } catch (err) {
    console.error('Error al obtener archivo:', err);
    res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
  }
});

// Ruta para descargar un archivo por su ID
cassandraFileRouter.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await CassandraFile.getFileById(fileId);
    
    if (!file) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    
    res.set('Content-Type', file.content_type);
    res.set('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.send(file.data);
  } catch (err) {
    console.error('Error al descargar archivo:', err);
    res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
  }
});

// Ruta para listar archivos de un tema
cassandraFileRouter.get('/list/topic/:courseId/:topicId', async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    const files = await CassandraFile.getFilesByTopicId(courseId, topicId);
    
    res.status(200).json(files);
  } catch (err) {
    console.error('Error al listar archivos:', err);
    res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
  }
});

// Ruta para listar archivos de un subtema
cassandraFileRouter.get('/list/subtopic/:courseId/:topicId/:subtopicId', async (req, res) => {
  try {
    const { courseId, topicId, subtopicId } = req.params;
    const files = await CassandraFile.getFilesBySubtopicId(courseId, topicId, subtopicId);
    
    res.status(200).json(files);
  } catch (err) {
    console.error('Error al listar archivos:', err);
    res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
  }
});

// Ruta para eliminar un archivo
cassandraFileRouter.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const deleted = await CassandraFile.deleteFileById(fileId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    
    res.status(200).json({ message: 'Archivo eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar archivo:', err);
    res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
  }
});

export default cassandraFileRouter;