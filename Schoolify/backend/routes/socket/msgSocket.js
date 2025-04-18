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
      console.log(`Socket ${socket.id} se unió a sala: ${roomId}`);

      // Obtener historial de mensajes desde Redis
      try {
        const messages = await redis.lrange(`chat:${roomId}`, 0, -1);
        const parsed = messages.map((msg) => JSON.parse(msg));
        socket.emit("chatHistory", parsed);
      } catch (err) {
        console.error("Error al obtener historial:", err);
      }
    });

    // Handle sending a message
    socket.on("sendMessage", async ({ roomId, message }) => {
      try {
        // Add timestamp if not provided
        if (!message.timestamp) {
          message.timestamp = new Date().toISOString();
        }
        
        // Add sender information if not provided
        if (!message.sender) {
          message.sender = userInfo.username;
        }
        
        // Guardar en Redis
        await redis.rpush(`chat:${roomId}`, JSON.stringify(message));
        
        // Also store in a separate list for the recipient
        if (message.receiver) {
          await redis.rpush(`user:${message.receiver}:messages`, JSON.stringify({
            ...message,
            roomId
          }));
        }

        // Emitir en tiempo real a todos los usuarios en esa sala
        io.to(roomId).emit("receiveMessage", message);
        
        // Also send to the recipient's personal room if they're not in the chat room
        if (message.receiver) {
          io.to(`user:${message.receiver}`).emit("newMessage", {
            ...message,
            roomId
          });
        }
      } catch (err) {
        console.error("Error al guardar/enviar mensaje:", err);
      }
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
