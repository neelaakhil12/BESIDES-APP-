import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

// Get user profile by username or id
router.get('/:identifier', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { identifier } = req.params;
    const currentUserId = req.userId;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: identifier }, { username: identifier.toLowerCase() }],
      },
      include: {
        profile: true,
        voiceBio: true,
        _count: {
          select: {
            followers: true,
            following: true,
            videos: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profile: user.profile,
        voiceBio: user.voiceBio,
        stats: {
          videos: user._count.videos,
          audience: user._count.followers,
          interests: user._count.following,
        },
        isFollowing,
        isSelf: currentUserId === user.id,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update profile details
router.put('/profile', authenticateToken, upload.single('avatar'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { fullName, bio, themePreference } = req.body;
    let avatarUrl = req.body.avatarUrl;

    if (req.file) {
      avatarUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }

    if (fullName) {
      await prisma.user.update({
        where: { id: userId },
        data: { fullName },
      });
    }

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        bio: bio !== undefined ? bio : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        themePreference: themePreference !== undefined ? themePreference : undefined,
      },
      create: {
        userId,
        bio: bio || '',
        avatarUrl: avatarUrl || '',
        themePreference: themePreference || 'dark',
      },
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Upload or replace Voice Bio (Strict max 30s)
router.post('/voice-bio', authenticateToken, upload.single('audio'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const duration = parseFloat(req.body.duration || '0');

    if (duration > 30.5) {
      return res.status(400).json({ success: false, message: 'Voice Bio duration cannot exceed 30 seconds' });
    }

    let audioUrl = req.body.audioUrl;
    if (req.file) {
      audioUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }

    if (!audioUrl) {
      return res.status(400).json({ success: false, message: 'Audio file or audio URL is required' });
    }

    const voiceBio = await prisma.voiceBio.upsert({
      where: { userId },
      update: {
        audioUrl,
        duration: duration || 7.0,
        waveform: req.body.waveform || JSON.stringify([0.2, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 0.3]),
      },
      create: {
        userId,
        audioUrl,
        duration: duration || 7.0,
        waveform: req.body.waveform || JSON.stringify([0.2, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 0.3]),
      },
    });

    return res.json({
      success: true,
      message: 'Voice Bio saved successfully',
      voiceBio,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to upload voice bio' });
  }
});

// Delete Voice Bio
router.delete('/voice-bio', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    await prisma.voiceBio.deleteMany({
      where: { userId },
    });
    return res.json({ success: true, message: 'Voice Bio deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Follow / Unfollow User
router.post('/:id/follow', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const followerId = req.userId!;
    const followingId = req.params.id;

    if (followerId === followingId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      return res.json({ success: true, isFollowing: false, message: 'Unfollowed successfully' });
    } else {
      await prisma.follow.create({
        data: { followerId, followingId },
      });
      return res.json({ success: true, isFollowing: true, message: 'Followed successfully' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user videos / moments
router.get('/:id/videos', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const videos = await prisma.video.findMany({
      where: { userId: id },
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
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return res.json({ success: true, videos });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
