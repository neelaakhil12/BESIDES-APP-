import { Router, Response } from 'express';
import prisma from '../prisma';

const router = Router();

// Get curated background music library for video editor
router.get('/', async (req, res: Response) => {
  try {
    const tracks = await prisma.musicTrack.findMany();
    return res.json({ success: true, tracks });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
