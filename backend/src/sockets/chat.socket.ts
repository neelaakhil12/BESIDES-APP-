import { Server, Socket } from 'socket.io';
import prisma from '../prisma';

export const setupSocketHandlers = (io: Server) => {
  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.on('connection', (socket: Socket) => {
    // Register user session
    socket.on('user_connected', (userId: string) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        io.emit('online_users_list', Array.from(onlineUsers.keys()));
      }
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(conversationId);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(conversationId);
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId, username }) => {
      socket.to(conversationId).emit('user_typing', { conversationId, username, isTyping: true });
    });

    socket.on('typing_stop', ({ conversationId, username }) => {
      socket.to(conversationId).emit('user_typing', { conversationId, username, isTyping: false });
    });

    // Live message sending
    socket.on('send_message', async (data: { conversationId: string; senderId: string; text?: string; mediaUrl?: string; mediaType?: string }) => {
      try {
        const { conversationId, senderId, text, mediaUrl, mediaType } = data;

        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId,
            text: text || null,
            mediaUrl: mediaUrl || null,
            mediaType: mediaType || null,
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profile: { select: { avatarUrl: true } },
              },
            },
          },
        });

        // Broadcast to everyone in conversation room
        io.to(conversationId).emit('new_message', message);
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('online_users_list', Array.from(onlineUsers.keys()));
    });
  });
};
