import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'besides_jwt_super_access_secret_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'besides_jwt_super_refresh_secret_2026';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

const generateTokens = (userId: string, username: string, email: string) => {
  const accessToken = jwt.sign({ userId, username, email }, ACCESS_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    }

    const { fullName, username, email, password } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({ success: false, message: 'Email is already registered' });
      }
      return res.status(409).json({ success: false, message: 'Username is already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        profile: {
          create: {
            bio: 'Hey there! I am on Besides.',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            locationVisibility: false,
            themePreference: 'dark',
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const tokens = generateTokens(user.id, user.username, user.email);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
      tokens,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    }

    const { identifier, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { username: identifier.toLowerCase() },
        ],
      },
      include: {
        profile: true,
        voiceBio: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email/username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email/username or password' });
    }

    const tokens = generateTokens(user.id, user.username, user.email);

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profile: user.profile,
        voiceBio: user.voiceBio,
      },
      tokens,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get Current User
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
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
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Forgot / Reset Password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Email or mobile number is required' });
  }
  // In MVP, confirm delivery of reset token / OTP simulation
  return res.json({
    success: true,
    message: `Password reset link / OTP has been sent to ${identifier}.`,
  });
});

export default router;
