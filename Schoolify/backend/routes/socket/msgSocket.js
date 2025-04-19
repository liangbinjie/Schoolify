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
      console.log(`[SERVER] Socket ${socket.id} joined room: ${roomId}`);

      try {
        // Get message history from Redis
        const messages = await redis.lrange(`chat:${roomId}`, 0, -1);
        const parsed = messages.map((msg) => JSON.parse(msg));
        console.log(`[SERVER] Message history for ${roomId}:`, parsed);

        // Send history to client
        socket.emit("chatHistory", parsed);
      } catch (err) {
        console.error(`[SERVER] Error getting history for ${roomId}:`, err);
      }
    });

    // Handle sending a message
    socket.on("sendMessage", async ({ roomId, message }) => {
      console.log(`[SERVER] Message received in room ${roomId}:`, message);

      try {
        // Ensure message has required fields
        const messageData = {
          ...message,
          timestamp: message.timestamp || new Date().toISOString(),
          sender: message.sender || userInfo.userId,
          roomId
        };

        // Save message to Redis
        await redis.rpush(`chat:${roomId}`, JSON.stringify(messageData));
        console.log(`[SERVER] Message saved to Redis for room ${roomId}`);

        // Emit message to all users in the room
        io.to(roomId).emit("receiveMessage", messageData);
        console.log(`[SERVER] Message emitted to room ${roomId}:`, messageData);

        // Also emit to recipient's personal room if they're not in the chat room
        if (message.receiver) {
          io.to(`user:${message.receiver}`).emit("newMessage", messageData);
        }
      } catch (err) {
        console.error(`[SERVER] Error sending message to room ${roomId}:`, err);
      }
    });
    
    // Handle marking messages as read
    socket.on("markAsRead", async ({ roomId, username }) => {
      try {
        // Get all messages for this room
        const messages = await redis.lrange(`chat:${roomId}`, 0, -1);
        const parsedMessages = messages.map(msg => JSON.parse(msg));
        
        // Find unread messages for this user
        const unreadMessages = parsedMessages.filter(msg => 
          msg.receiver === username && !msg.read
        );
        
        // Mark messages as read
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
        
        // Update messages in Redis
        await redis.del(`chat:${roomId}`);
        if (updatedMessages.length > 0) {
          await redis.rpush(`chat:${roomId}`, ...updatedMessages.map(msg => JSON.stringify(msg)));
        }
        
        // Notify the sender that their messages have been read
        io.to(roomId).emit("messagesRead", {
          roomId,
          reader: username,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error("[SERVER] Error marking messages as read:", err);
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
