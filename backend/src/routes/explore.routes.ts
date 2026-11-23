import { Router, Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Explore / Search endpoint
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    const tab = (req.query.tab as string) || 'trending'; // 'trending' | 'hashtags' | 'users' | 'videos'

    // Trending hashtags
    const trendingHashtags = await prisma.hashtag.findMany({
      take: 10,
      orderBy: { videoCount: 'desc' },
    });

    // Users search
    let users: any[] = [];
    if (q || tab === 'users') {
      users = await prisma.user.findMany({
        where: q
          ? {
              OR: [
                { username: { contains: q } },
                { fullName: { contains: q } },
              ],
            }
          : undefined,
        take: 20,
        select: {
          id: true,
          username: true,
          fullName: true,
          profile: true,
          voiceBio: true,
          _count: {
            select: { followers: true, videos: true },
          },
        },
      });
    }

    // Videos search / explore grid
    let videos: any[] = [];
    let videoWhere: any = {};

    if (q) {
      videoWhere = {
        OR: [
          { caption: { contains: q } },
          { hashtags: { some: { hashtag: { name: { contains: q.replace('#', '') } } } } },
        ],
      };
    }

    videos = await prisma.video.findMany({
      where: videoWhere,
      take: 24,
      orderBy: [{ likeCount: 'desc' }, { viewCount: 'desc' }, { createdAt: 'desc' }],
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
      },
    });

    return res.json({
      success: true,
      query: q,
      tab,
      trendingHashtags,
      users,
      videos,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
