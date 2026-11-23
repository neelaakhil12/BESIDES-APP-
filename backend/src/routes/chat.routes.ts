import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

// Get all conversations for current user (All, Direct, Groups)
router.get('/conversations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const filter = (req.query.filter as string) || 'all'; // 'all' | 'direct' | 'groups'

    let whereClause: any = {
      members: {
        some: { userId },
      },
    };

    if (filter === 'direct') {
      whereClause.isGroup = false;
    } else if (filter === 'groups') {
      whereClause.isGroup = true;
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profile: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { id: true, username: true, fullName: true },
            },
          },
        },
      },
    });

    const formatted = conversations.map((conv) => {
      const currentMember = conv.members.find((m) => m.userId === userId);
      const otherMembers = conv.members.filter((m) => m.userId !== userId);
      const isDirect = !conv.isGroup;
      const otherUser = isDirect && otherMembers.length > 0 ? otherMembers[0].user : null;

      const title = conv.isGroup ? conv.name || 'Group' : otherUser?.fullName || 'User';
      const avatarUrl = conv.isGroup ? conv.avatarUrl : otherUser?.profile?.avatarUrl;
      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        isGroup: conv.isGroup,
        name: title,
        avatarUrl,
        unreadCount: currentMember?.unreadCount || 0,
        otherUser: otherUser
          ? {
              id: otherUser.id,
              username: otherUser.username,
              fullName: otherUser.fullName,
              avatarUrl: otherUser.profile?.avatarUrl,
            }
          : null,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              text: lastMessage.text,
              mediaType: lastMessage.mediaType,
              createdAt: lastMessage.createdAt,
              senderName: lastMessage.sender.fullName,
              isSelf: lastMessage.senderId === userId,
            }
          : null,
        updatedAt: conv.updatedAt,
      };
    });

    return res.json({ success: true, conversations: formatted });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get or Create direct 1-1 conversation with a user
router.post('/direct/:otherUserId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { otherUserId } = req.params;

    if (userId === otherUserId) {
      return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
    }

    // Find existing direct conversation
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: otherUserId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true, fullName: true, profile: true },
            },
          },
        },
      },
    });

    if (existing) {
      return res.json({ success: true, conversation: existing });
    }

    // Create new direct conversation
    const newConv = await prisma.conversation.create({
      data: {
        isGroup: false,
        members: {
          create: [
            { userId, role: 'member' },
            { userId: otherUserId, role: 'member' },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true, fullName: true, profile: true },
            },
          },
        },
      },
    });

    return res.status(201).json({ success: true, conversation: newConv });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create Group Chat
router.post('/groups', authenticateToken, upload.single('avatar'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, memberIds: rawMemberIds } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    let memberIds: string[] = [];
    if (typeof rawMemberIds === 'string') {
      try {
        memberIds = JSON.parse(rawMemberIds);
      } catch {
        memberIds = rawMemberIds.split(',').map((id) => id.trim());
      }
    } else if (Array.isArray(rawMemberIds)) {
      memberIds = rawMemberIds;
    }

    if (!memberIds.includes(userId)) {
      memberIds.push(userId);
    }

    let avatarUrl = req.body.avatarUrl;
    if (req.file) {
      avatarUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }

    const group = await prisma.conversation.create({
      data: {
        isGroup: true,
        name: name.trim(),
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300',
        members: {
          create: memberIds.map((mId) => ({
            userId: mId,
            role: mId === userId ? 'admin' : 'member',
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true, fullName: true, profile: true },
            },
          },
        },
      },
    });

    return res.status(201).json({ success: true, group });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create group' });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { conversationId } = req.params;

    // Verify membership
    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: 'You are not a member of this conversation' });
    }

    // Reset unread count for current user
    await prisma.conversationMember.update({
      where: { id: membership.id },
      data: { unreadCount: 0, lastReadAt: new Date() },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profile: {
              select: { avatarUrl: true },
            },
          },
        },
      },
    });

    return res.json({ success: true, messages });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Send a message (Text, Image, Video, or Video Reference)
router.post('/:conversationId/messages', authenticateToken, upload.single('media'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { conversationId } = req.params;
    const { text, mediaType, videoReferenceId } = req.body;

    let mediaUrl = req.body.mediaUrl;
    if (req.file) {
      mediaUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }

    if (!text && !mediaUrl && !videoReferenceId) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        text: text || null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || (mediaUrl ? 'image' : null),
        videoReferenceId: videoReferenceId || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profile: {
              select: { avatarUrl: true },
            },
          },
        },
      },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Increment unread count for other members
    await prisma.conversationMember.updateMany({
      where: {
        conversationId,
        userId: { not: userId },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    return res.status(201).json({ success: true, message });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

export default router;
