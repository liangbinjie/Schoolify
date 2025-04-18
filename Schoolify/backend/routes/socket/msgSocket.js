import redis from '../../db/redis.js';

export default function setupSocketIO(io) {
  io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);
    
    // Store user information when they connect
    const userInfo = {
      id: socket.id,
      username: socket.handshake.query.username || 'anonymous',
      userId: socket.handshake.query.userId || null
    };
    
    // Join a personal room for direct messages
    if (userInfo.username !== 'anonymous') {
      socket.join(`user:${userInfo.username}`);
      console.log(`User ${userInfo.username} joined personal room`);
    }

    // Handle joining a chat room
    socket.on("joinRoom", async ({ roomId }) => {
      socket.join(roomId);
      console.log(`[SERVER] Socket ${socket.id} se unió a la sala: ${roomId}`);

      try {
        // Obtener historial de mensajes desde Redis
        const messages = await redis.lrange(`chat:${roomId}`, 0, -1);
        const parsed = messages.map((msg) => JSON.parse(msg));
        console.log(`[SERVER] Historial de mensajes para ${roomId}:`, parsed);

        // Enviar historial al cliente
        socket.emit("chatHistory", parsed);
      } catch (err) {
        console.error(`[SERVER] Error al obtener historial para ${roomId}:`, err);
      }
    });

    // Handle sending a message
    socket.on("sendMessage", async ({ roomId, message }) => {
      console.log(`[SERVER] Mensaje recibido en la sala ${roomId}:`, message);

      // Asegúrate de que el mensaje tenga un timestamp y un remitente
      if (!message.timestamp) {
        message.timestamp = new Date().toISOString();
      }
      if (!message.sender) {
        message.sender = userInfo.username;
      }

      // Llamar a la función para enviar el mensaje
      await sendMessageToRoom(io, roomId, message);
    });
    
    // Handle marking messages as read
    socket.on("markAsRead", async ({ roomId, username }) => {
      try {
        // Get all unread messages for this user in this room
        const messages = await redis.lrange(`chat:${roomId}`, 0, -1);
        const unreadMessages = messages
          .map(msg => JSON.parse(msg))
          .filter(msg => msg.receiver === username && !msg.read);
        
        // Mark each message as read
        for (const message of unreadMessages) {
          message.read = true;
          message.readAt = new Date().toISOString();
          
          // Update the message in Redis
          // Note: This is a simplified approach. In a production app, you'd need a more
          // sophisticated way to update specific messages in a list
          await redis.del(`chat:${roomId}`);
          await redis.rpush(`chat:${roomId}`, ...messages.map(msg => JSON.stringify(msg)));
        }
        
        // Notify the sender that their messages have been read
        io.to(roomId).emit("messagesRead", {
          roomId,
          reader: username,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    });
    
    // Handle typing indicators
    socket.on("typing", ({ roomId, username, isTyping }) => {
      socket.to(roomId).emit("userTyping", { username, isTyping });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Usuario desconectado:", socket.id);
    });
  });
}

async function sendMessageToRoom(io, roomId, message) {
  try {
    // Guardar el mensaje en Redis
    await redis.rpush(`chat:${roomId}`, JSON.stringify(message));
    console.log(`[SERVER] Mensaje guardado en Redis para la sala ${roomId}`);

    // Emitir el mensaje a todos los usuarios en la sala
    io.to(roomId).emit("receiveMessage", message);
    console.log(`[SERVER] Mensaje emitido a la sala ${roomId}:`, message);
  } catch (err) {
    console.error(`[SERVER] Error al enviar mensaje a la sala ${roomId}:`, err);
  }
}
