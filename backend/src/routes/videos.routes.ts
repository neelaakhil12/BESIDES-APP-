import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

// Get Video Feed (For You & Following)
router.get('/feed', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const feedType = (req.query.type as string) || 'for_you';
    const currentUserId = req.headers['authorization'] ? (req as any).userId : null;
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    let whereClause: any = {};

    if (feedType === 'following' && currentUserId) {
      const following = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      const followingIds = following.map((f) => f.followingId);
      whereClause = { userId: { in: followingIds } };
    }

    const videos = await prisma.video.findMany({
      where: whereClause,
      take: limit,
      skip,
      orderBy: feedType === 'following' ? { createdAt: 'desc' } : [{ likeCount: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profile: true,
          },
        },
        hashtags: {
          include: { hashtag: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    // Check if current user liked each video
    let likedVideoIds = new Set<string>();
    let followingUserIds = new Set<string>();

    if (currentUserId) {
      const userLikes = await prisma.videoLike.findMany({
        where: {
          userId: currentUserId,
          videoId: { in: videos.map((v) => v.id) },
        },
        select: { videoId: true },
      });
      likedVideoIds = new Set(userLikes.map((l) => l.videoId));

      const userFollows = await prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: videos.map((v) => v.userId) },
        },
        select: { followingId: true },
      });
      followingUserIds = new Set(userFollows.map((f) => f.followingId));
    }

    const formatted = videos.map((v) => ({
      id: v.id,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl,
      caption: v.caption,
      duration: v.duration,
      viewCount: v.viewCount,
      likeCount: v.likeCount,
      commentCount: v.commentCount,
      shareCount: v.shareCount,
      createdAt: v.createdAt,
      user: v.user,
      hashtags: v.hashtags.map((h) => h.hashtag.name),
      isLiked: likedVideoIds.has(v.id),
      isFollowing: followingUserIds.has(v.userId),
    }));

    return res.json({ success: true, videos: formatted, page, hasMore: videos.length === limit });
  } catch (error: any) {
    console.error('Feed error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Upload Video
router.post('/upload', authenticateToken, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { caption, hashtags: rawHashtags, duration } = req.body;

    let videoUrl = req.body.videoUrl;
    let thumbnailUrl = req.body.thumbnailUrl;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    if (files?.video?.[0]) {
      videoUrl = `${baseUrl}/uploads/${files.video[0].filename}`;
    }
    if (files?.thumbnail?.[0]) {
      thumbnailUrl = `${baseUrl}/uploads/${files.thumbnail[0].filename}`;
    }

    if (!videoUrl) {
      return res.status(400).json({ success: false, message: 'Video file or videoUrl is required' });
    }

    const video = await prisma.video.create({
      data: {
        userId,
        videoUrl,
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
        caption: caption || '',
        duration: duration ? parseFloat(duration) : 15.0,
      },
    });

    // Parse and link hashtags
    if (rawHashtags) {
      const tagList: string[] = typeof rawHashtags === 'string'
        ? rawHashtags.split(/[,\s#]+/).filter(Boolean)
        : rawHashtags;

      for (const tag of tagList) {
        const cleanTag = tag.trim().toLowerCase();
        if (cleanTag) {
          const hashtagRecord = await prisma.hashtag.upsert({
            where: { name: cleanTag },
            update: { videoCount: { increment: 1 } },
            create: { name: cleanTag, videoCount: 1 },
          });

          await prisma.videoHashtag.create({
            data: {
              videoId: video.id,
              hashtagId: hashtagRecord.id,
            },
          });
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Video uploaded and published successfully',
      video,
    });
  } catch (error: any) {
    console.error('Video upload error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload video' });
  }
});

// Delete Video
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    if (video.userId !== userId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this video' });
    }

    await prisma.video.delete({ where: { id } });
    return res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Track view and watch time
router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { watchDuration, userId } = req.body;

    await prisma.video.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    if (watchDuration) {
      await prisma.videoView.create({
        data: {
          videoId: id,
          userId: userId || null,
          watchDuration: parseFloat(watchDuration),
        },
      });
    }

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false });
  }
});

export default router;
