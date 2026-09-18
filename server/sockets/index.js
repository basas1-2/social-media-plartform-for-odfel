const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// Map of online users: userId -> [socketIds]
const onlineUsers = new Map();

const addUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);
};

const removeUser = (userId, socketId) => {
  if (onlineUsers.has(userId)) {
    onlineUsers.get(userId).delete(socketId);
    if (onlineUsers.get(userId).size === 0) {
      onlineUsers.delete(userId);
    }
  }
};

const getOnlineSockets = (userId) => {
  return onlineUsers.get(userId) || new Set();
};

const setupSocket = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    addUser(userId, socket.id);

    // Mark user online
    User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: Date.now() }).then(() => {
      io.emit('user-online', { userId });
    });

    // Join personal room for notifications
    socket.join(`user-${userId}`);

    // Send online users list to the newly connected user
    const onlineUserIds = [...onlineUsers.keys()];
    socket.emit('online-users', onlineUserIds);

    // Join conversation rooms
    Conversation.find({ members: userId }).then((conversations) => {
      conversations.forEach((c) => {
        socket.join(`conversation-${c._id}`);
      });
    });

    // Handle sending a message
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, text, image, video, document } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.members.includes(userId)) {
          return socket.emit('error', { message: 'Not authorized' });
        }

        const message = await Message.create({
          conversationId,
          senderId: userId,
          text: text || '',
          image: image || '',
          video: video || '',
          document: document || '',
        });

        conversation.lastMessage = text || (image ? '📷 Photo' : video ? '🎬 Video' : document ? '📄 Document' : '');
        conversation.lastMessageSender = userId;
        conversation.lastMessageAt = Date.now();
        await conversation.save();

        const populated = await Message.findById(message._id).populate(
          'senderId',
          'fullname username profilePicture'
        );

        // Emit to conversation room
        io.to(`conversation-${conversationId}`).emit('message-received', populated);

        // Notify the other user
        const receiverId = conversation.members.find((m) => m.toString() !== userId.toString());
        if (receiverId) {
          const receiverSockets = getOnlineSockets(receiverId.toString());
          receiverSockets.forEach((sid) => {
            io.to(sid).emit('new-message', {
              conversationId,
              message: populated,
            });
          });

          // Create notification
          const sender = await User.findById(userId);
          await Notification.create({
            receiverId,
            senderId: userId,
            type: 'message',
            conversationId,
            text: `${sender.fullname} sent you a message`,
          });

          io.to(`user-${receiverId}`).emit('notification', {
            type: 'message',
            from: userId,
            conversationId,
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      socket.to(`conversation-${conversationId}`).emit('typing', {
        conversationId,
        userId,
        isTyping,
      });
    });

    // Mark message as seen
    socket.on('message-seen', async (data) => {
      const { messageId, conversationId } = data;
      try {
        const message = await Message.findById(messageId);
        if (message) {
          if (!message.seenBy.includes(userId)) {
            message.seenBy.push(userId);
          }
          message.seen = true;
          await message.save();
        }
        io.to(`conversation-${conversationId}`).emit('message-seen', {
          messageId,
          conversationId,
          userId,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Live notification for likes/comments - relayed from HTTP via socket
    socket.on('notify', (data) => {
      const { receiverId, type, postId } = data;
      io.to(`user-${receiverId}`).emit('notification', {
        type,
        from: userId,
        postId,
      });
    });

    // Relay group changes so open group views stay current for everyone.
    socket.on('group-updated', (data) => {
      if (data?.groupId) {
        socket.broadcast.emit('group-updated', {
          groupId: data.groupId,
          action: data.action,
          memberCount: data.memberCount,
          userId,
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      removeUser(userId, socket.id);
      User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: Date.now() }).then(() => {
        io.emit('user-offline', { userId });
      });
    });
  });
};

module.exports = { setupSocket, onlineUsers, getOnlineSockets };
