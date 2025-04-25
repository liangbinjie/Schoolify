import { Client } from 'cassandra-driver';

// Variables para el singleton pattern
let client = null;
let isInitializing = false;
let initPromise = null;

async function initCassandra() {
  if (isInitializing) {
    console.log('⏳ Inicialización de Cassandra ya en progreso, esperando...');
    return initPromise;
  }
  
  if (client) {
    console.log('✅ Cassandra ya está inicializada');
    return client;
  }
  
  isInitializing = true;
  
  initPromise = (async () => {
    try {
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
      
      console.log('⏳ Creando keyspace schoolify si no existe...');
      await initialClient.execute(`
        CREATE KEYSPACE IF NOT EXISTS schoolify 
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 2}
      `);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Keyspace schoolify verificado/creado');
      
      await initialClient.shutdown();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      
      await newClient.connect();
      console.log('🚀 Conectado a Cassandra con keyspace schoolify');
      
      await newClient.execute(`
        CREATE TABLE IF NOT EXISTS files (
          id uuid PRIMARY KEY,
          course_id text,
          topic_id text,
          subtopic_id text,
          filename text,
          original_name text,
          content_type text,
          size bigint,
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
          size bigint,
          PRIMARY KEY ((course_id, topic_id, subtopic_id), file_id)
        )
      `);
      
      console.log('✅ Tablas de Cassandra inicializadas correctamente');
      
      client = newClient;
      return client;
    } catch (err) {
      console.error('❌ Error conectando a Cassandra:', err);
      throw err;
    } finally {
      isInitializing = false;
    }
  })();
  
  return initPromise;
}

function getClient() {
  if (!client) {
    throw new Error('Cassandra client not initialized. Call initCassandra() first.');
  }
  return client;
}

async function checkCassandraCluster() {
  try {
    const client = await initCassandra();
    
    console.log('🔍 Verificando conexión al clúster de Cassandra...');
    
    const rs = await client.execute('SELECT release_version FROM system.local');
    console.log(`✅ Versión de Cassandra: ${rs.first().release_version}`);
    
    const nodes = await client.execute('SELECT host_id, data_center, rack, release_version FROM system.local');
    console.log('📌 Nodo local conectado:');
    nodes.rows.forEach(node => {
      console.log(`  - ID: ${node.host_id}, DC: ${node.data_center}, Rack: ${node.rack}, Versión: ${node.release_version}`);
    });
    
    const peers = await client.execute('SELECT peer, data_center, rack, release_version FROM system.peers');
    console.log(`📌 Nodos peer detectados: ${peers.rows.length}`);
    peers.rows.forEach(peer => {
      console.log(`  - Peer: ${peer.peer}, DC: ${peer.data_center}, Rack: ${peer.rack}, Versión: ${peer.release_version}`);
    });

    if (peers.rows.length === 1) {
      console.log('✅ Detectado correctamente un clúster de 2 nodos');
    } else if (peers.rows.length === 0) {
      console.log('⚠️ Solo se detectó un nodo. Es posible que el segundo nodo no esté funcionando o no sea visible.');
    } else {
      console.log(`ℹ️ Detectados ${peers.rows.length + 1} nodos en total.`);
    }
    
    return {
      connected: true,
      localNode: nodes.rows[0],
      peerNodes: peers.rows,
      totalNodes: 1 + peers.rows.length
    };
  } catch (err) {
    console.error('❌ Error verificando el clúster de Cassandra:', err);
    return {
      connected: false,
      error: err.message
    };
  }
}

export { initCassandra, getClient, checkCassandraCluster };