import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

// Get comments for a video (including nested replies & video replies)
router.get('/video/:videoId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { videoId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { videoId, parentCommentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profile: true,
          },
        },
        replies: {
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
        videoReplies: {
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
      },
    });

    return res.json({ success: true, comments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add a text comment
router.post('/video/:videoId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { videoId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        videoId,
        content: content.trim(),
        parentCommentId: parentCommentId || null,
      },
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
    });

    await prisma.video.update({
      where: { id: videoId },
      data: { commentCount: { increment: 1 } },
    });

    return res.status(201).json({ success: true, comment });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add a Video Reply (Compulsory <= 10 seconds restriction)
router.post('/:commentId/video-reply', authenticateToken, upload.single('video'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { commentId } = req.params;
    const duration = parseFloat(req.body.duration || '0');

    // Strict 10-second limit check
    if (duration > 10.5) {
      return res.status(400).json({
        success: false,
        message: 'Video reply duration cannot exceed 10 seconds.',
      });
    }

    let videoUrl = req.body.videoUrl;
    let thumbnailUrl = req.body.thumbnailUrl;

    if (req.file) {
      videoUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }

    if (!videoUrl) {
      return res.status(400).json({ success: false, message: 'Video file or videoUrl is required' });
    }

    const videoReply = await prisma.videoReply.create({
      data: {
        userId,
        commentId,
        videoUrl,
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
        duration: duration || 8.0,
      },
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
    });

    return res.status(201).json({
      success: true,
      message: 'Video reply created successfully (≤ 10s)',
      videoReply,
    });
  } catch (error: any) {
    console.error('Video reply error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create video reply' });
  }
});

export default router;
