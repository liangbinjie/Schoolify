import { getClient } from '../cassandra.js';
import { v4 as uuidv4 } from 'uuid';

class CassandraFile {
  static async saveFile(fileData) {
    const fileId = uuidv4();
    const client = getClient();
    const params = [
      fileId,
      fileData.courseId,
      fileData.topicId,
      fileData.subtopicId || null,
      fileData.filename,
      fileData.originalName,
      fileData.contentType,
      fileData.size,
      fileData.data,
      new Date(),
      fileData.uploadedBy
    ];
    
    try {
      console.log('Guardando archivo en Cassandra:', {
        id: fileId,
        courseId: fileData.courseId,
        topicId: fileData.topicId,
        subtopicId: fileData.subtopicId,
        filename: fileData.filename,
        size: fileData.size,
        contentType: fileData.contentType
      });
      
      // Insertar en tabla principal de archivos
      await client.execute(
        `INSERT INTO files 
         (id, course_id, topic_id, subtopic_id, filename, original_name, content_type, size, data, upload_date, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params,
        { prepare: true }
      );
      
      // Insertar en tabla secundaria para búsqueda
      await client.execute(
        `INSERT INTO files_by_course
         (course_id, topic_id, subtopic_id, file_id, filename, content_type, size)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          fileData.courseId,
          fileData.topicId,
          fileData.subtopicId || null,
          fileId,
          fileData.filename,
          fileData.contentType,
          fileData.size
        ],
        { prepare: true }
      );
      
      console.log('✅ Archivo guardado con éxito en Cassandra');
      return { id: fileId, ...fileData };
    } catch (err) {
      console.error('❌ Error guardando archivo en Cassandra:', err);
      throw err;
    }
  }
  
  static async getFileById(fileId) {
    try {
      const client = getClient();
      const result = await client.execute(
        'SELECT * FROM files WHERE id = ?',
        [fileId],
        { prepare: true }
      );
      
      if (result.rowLength === 0) {
        return null;
      }
      
      return result.first();
    } catch (err) {
      console.error('Error obteniendo archivo de Cassandra:', err);
      throw err;
    }
  }
  
  static async getFilesByTopicId(courseId, topicId) {
    try {
      const client = getClient();
      const result = await client.execute(
        'SELECT * FROM files_by_course WHERE course_id = ? AND topic_id = ?',
        [courseId, topicId],
        { prepare: true }
      );
      
      return result.rows;
    } catch (err) {
      console.error('Error obteniendo archivos por tema:', err);
      throw err;
    }
  }
  
  static async getFilesBySubtopicId(courseId, topicId, subtopicId) {
    try {
      const client = getClient();
      const result = await client.execute(
        'SELECT * FROM files_by_course WHERE course_id = ? AND topic_id = ? AND subtopic_id = ?',
        [courseId, topicId, subtopicId],
        { prepare: true }
      );
      
      return result.rows;
    } catch (err) {
      console.error('Error obteniendo archivos por subtema:', err);
      throw err;
    }
  }
  
  static async deleteFileById(fileId) {
    try {
      const client = getClient();
      // Primero obtener los datos del archivo para poder eliminar de la tabla secundaria
      const fileData = await this.getFileById(fileId);
      if (!fileData) {
        return false;
      }
      
      // Eliminar de la tabla principal
      await client.execute(
        'DELETE FROM files WHERE id = ?',
        [fileId],
        { prepare: true }
      );
      
      // Eliminar de la tabla secundaria
      await client.execute(
        'DELETE FROM files_by_course WHERE course_id = ? AND topic_id = ? AND subtopic_id = ? AND file_id = ?',
        [fileData.course_id, fileData.topic_id, fileData.subtopic_id, fileId],
        { prepare: true }
      );
      
      return true;
    } catch (err) {
      console.error('Error eliminando archivo de Cassandra:', err);
      throw err;
    }
  }
}

export default CassandraFile;