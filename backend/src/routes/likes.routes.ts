import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Toggle like on a video
router.post('/:videoId/toggle', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { videoId } = req.params;

    const existingLike = await prisma.videoLike.findUnique({
      where: {
        userId_videoId: { userId, videoId },
      },
    });

    let isLiked = false;
    let likeCountDelta = 0;

    if (existingLike) {
      await prisma.videoLike.delete({
        where: { id: existingLike.id },
      });
      likeCountDelta = -1;
      isLiked = false;
    } else {
      await prisma.videoLike.create({
        data: { userId, videoId },
      });
      likeCountDelta = 1;
      isLiked = true;
    }

    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: { likeCount: { increment: likeCountDelta } },
      select: { likeCount: true },
    });

    return res.json({
      success: true,
      isLiked,
      likeCount: Math.max(0, updatedVideo.likeCount),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
