import { Client } from 'cassandra-driver';

// Variables para el singleton pattern
let client = null;
let isInitializing = false;
let initPromise = null;

// Inicializar la conexión - implementando patrón singleton
async function initCassandra() {
  // Si ya está inicializando, retorna la promesa existente
  if (isInitializing) {
    console.log('⏳ Inicialización de Cassandra ya en progreso, esperando...');
    return initPromise;
  }
  
  // Si ya está inicializado, retorna el cliente existente
  if (client) {
    console.log('✅ Cassandra ya está inicializada');
    return client;
  }
  
  // Marca que estamos inicializando
  isInitializing = true;
  
  // Crear la promesa de inicialización
  initPromise = (async () => {
    try {
      // Primero nos conectamos sin un keyspace específico
      const initialClient = new Client({
        contactPoints: ['localhost:9042', 'localhost:9043'],
        localDataCenter: 'datacenter1',
        credentials: { 
          username: 'cassandra', 
          password: 'cassandra' 
        },
      });
      
      console.log('⏳ Conectando a Cassandra...');
      await initialClient.connect();
      console.log('🔄 Conectado inicialmente a Cassandra');
      
      // Crear keyspace si no existe con tiempo de espera
      console.log('⏳ Creando keyspace schoolify si no existe...');
      await initialClient.execute(`
        CREATE KEYSPACE IF NOT EXISTS schoolify 
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 2}
      `);
      
      // Esperar un momento para asegurarnos de que el keyspace se haya propagado
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Keyspace schoolify verificado/creado');
      
      // Cerramos el cliente inicial
      await initialClient.shutdown();
      
      // Esperar un momento antes de reconectar para evitar problemas
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Creamos un nuevo cliente que use el keyspace
      const newClient = new Client({
        contactPoints: ['localhost:9042', 'localhost:9043'],
        localDataCenter: 'datacenter1',
        keyspace: 'schoolify',
        credentials: { 
          username: 'cassandra', 
          password: 'cassandra' 
        },
        socketOptions: {
          readTimeout: 60000 // Aumentar timeout a 60 segundos
        }
      });
      
      // Conectamos el nuevo cliente
      await newClient.connect();
      console.log('🚀 Conectado a Cassandra con keyspace schoolify');
      
      // Crear tablas con tiempo de espera entre cada una
      await newClient.execute(`
        CREATE TABLE IF NOT EXISTS files (
          id uuid PRIMARY KEY,
          course_id text,
          topic_id text,
          subtopic_id text,
          filename text,
          original_name text,
          content_type text,
          size int,
          data blob,
          upload_date timestamp,
          uploaded_by text
        )
      `);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await newClient.execute(`
        CREATE TABLE IF NOT EXISTS files_by_course (
          course_id text,
          topic_id text,
          subtopic_id text,
          file_id uuid,
          filename text,
          content_type text,
          size int,
          PRIMARY KEY ((course_id, topic_id), subtopic_id, file_id)
        )
      `);
      
      console.log('✅ Tablas de Cassandra inicializadas correctamente');
      
      // Guardar el cliente en la variable global
      client = newClient;
      return client;
    } catch (err) {
      console.error('❌ Error conectando a Cassandra:', err);
      throw err;
    } finally {
      // Marcar que ya no estamos inicializando
      isInitializing = false;
    }
  })();
  
  return initPromise;
}

// Función para obtener el cliente
function getClient() {
  if (!client) {
    throw new Error('Cassandra client not initialized. Call initCassandra() first.');
  }
  return client;
}

export { initCassandra, getClient };