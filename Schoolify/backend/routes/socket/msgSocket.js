import redis from '../../db/redis.js';

export default function setupSocketIO(io) {
  // Registro cuando el servidor de socket comienza
  console.log('[Socket Server] Initializing...');

  io.on("connection", (socket) => {
    console.log("[Socket Server] New connection:", socket.id);
    
    // Almacenar información del usuario cuando se conectan
    const userInfo = {
      id: socket.id,
      username: socket.handshake.query.username || 'anonymous',
      userId: socket.handshake.query.userId || null
    };
    
    console.log("[Socket Server] User connected:", userInfo);

    // Prueba de conexión de Redis en la conexión del usuario
    redis.ping().then(() => {
      console.log('[Redis] Prueba de conexión exitosa');
    }).catch(err => {
      console.error('[Redis] Prueba de conexión fallida:', err);
    });
    
    // Unirse a una sala personal para mensajes directos
    if (userInfo.username !== 'anonymous') {
      socket.join(`user:${userInfo.username}`);
      console.log(`[Socket Server] Usuario ${userInfo.username} se unió a la sala personal`);
    }

    // Manejar unirse a una sala de chat
    socket.on("joinRoom", async ({ roomId }) => {
      try {
        console.log(`[Socket Server] Usuario ${userInfo.username} se une a la sala:`, roomId);
        socket.join(roomId);

        // Obtener el historial de mensajes con Redis
        const messages = await redis.lrange(`chat:${roomId}`, 0, -1);
        console.log(`[Redis] Obtenidos ${messages.length} mensajes para la sala ${roomId}`);
        
        const parsed = messages.map((msg) => {
          try {
            return JSON.parse(msg);
          } catch (err) {
            console.error('[Redis] Error parsing message:', msg, err);
            return null;
          }
        }).filter(Boolean);

        console.log(`[Socket Server] Sending chat history to client:`, parsed);
        socket.emit("chatHistory", parsed);
      } catch (err) {
        console.error(`[Socket Server] Error in joinRoom:`, err);
      }
    });

    // Manejar enviar un mensaje
    socket.on("sendMessage", async ({ roomId, message }) => {
      if (!roomId || !message) {
        console.error('[Socket Server] Datos de mensaje inválidos:', {
          roomId,
          message
        });
        socket.emit('messageError', { error: 'Invalid message data' });
        return;
      }

      console.log(`[Socket Server] Received message:`, {
        roomId,
        message,
        userInfo
      });

      try {
        // Asegurar que el mensaje tenga los campos requeridos
        const messageData = {
          content: message.content,
          sender: message.sender,
          receiver: message.receiver,
          timestamp: message.timestamp || new Date().toISOString(),
          roomId
        };

        if (!messageData.content || !messageData.sender || !messageData.receiver) {
          throw new Error('Missing required message fields');
        }

        console.log("[Socket Server] Processed message data:", messageData);

        // Guardar mensaje en Redis
        await redis.rpush(`chat:${roomId}`, JSON.stringify(messageData));
        console.log(`[Redis] Mensaje guardado para la sala ${roomId}`);

        // Emitir mensaje a todos los usuarios en la sala
        io.to(roomId).emit("receiveMessage", messageData);
        console.log(`[Socket Server] Mensaje emitido a la sala ${roomId}`);

        // También emitir a la sala personal del destinatario
        io.to(`user:${messageData.receiver}`).emit("newMessage", messageData);
        console.log(`[Socket Server] Mensaje enviado a la sala personal del destinatario: ${messageData.receiver}`);
      } catch (err) {
        console.error(`[Socket Server] Error handling message:`, err);
        socket.emit('messageError', {
          error: err.message || 'Failed to send message'
        });
      }
    });
    
    // Manejar marcar mensajes como leídos
    socket.on("markAsRead", async ({ roomId, username }) => {
      console.log(`[Socket Server] Marcar mensajes como leídos en la sala ${roomId} por ${username}`);
      try {
        const messages = await redis.lrange(`chat:${roomId}`, 0, -1);
        const parsedMessages = messages.map(msg => JSON.parse(msg));
        
        const unreadMessages = parsedMessages.filter(msg => 
          msg.receiver === username && !msg.read
        );
        
        console.log(`[Socket Server] Found ${unreadMessages.length} unread messages`);
        
        if (unreadMessages.length > 0) {
          const updatedMessages = parsedMessages.map(msg => {
            if (msg.receiver === username && !msg.read) {
              return {
                ...msg,
                read: true,
                readAt: new Date().toISOString()
              };
            }
            return msg;
          });
          
          await redis.del(`chat:${roomId}`);
          await redis.rpush(`chat:${roomId}`, ...updatedMessages.map(msg => JSON.stringify(msg)));
          console.log(`[Redis] Updated ${updatedMessages.length} messages`);
          
          io.to(roomId).emit("messagesRead", {
            roomId,
            reader: username,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("[Socket Server] Error marking messages as read:", err);
      }
    });
    
    // Manejar indicadores de escritura
    socket.on("typing", ({ roomId, username, isTyping }) => {
      if (!roomId || !username) {
        console.error('[Socket Server] Datos de indicador de escritura inválidos:', {
          roomId,
          username,
          isTyping
        });
        return;
      }

      console.log(`[Socket Server] Typing indicator from ${username} in room ${roomId}:`, isTyping);
      socket.to(roomId).emit("userTyping", { username, isTyping });
    });

    // Manejar desconexión
    socket.on("disconnect", () => {
      console.log("[Socket Server] Usuario desconectado:", userInfo.username);
    });

    // Manejar errores
    socket.on('error', (error) => {
      console.error('[Socket Server] Error del socket:', error);
    });
  });
}
