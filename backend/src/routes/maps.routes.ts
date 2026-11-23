import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Haversine formula to calculate distance between two coordinates in meters
const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Toggle location visibility (Privacy control)
router.post('/visibility', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { enabled } = req.body;

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: { locationVisibility: !!enabled },
    });

    return res.json({
      success: true,
      locationVisibility: profile.locationVisibility,
      message: profile.locationVisibility
        ? 'Location visibility enabled. Nearby users within 300m can now discover you.'
        : 'Location visibility disabled. You are hidden from nearby searches.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update current user location and fetch nearby users within 300 meters
router.post('/nearby', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const currentLat = parseFloat(latitude);
    const currentLon = parseFloat(longitude);

    // Update current user's location
    await prisma.userLocation.upsert({
      where: { userId },
      update: { latitude: currentLat, longitude: currentLon, updatedAt: new Date() },
      create: { userId, latitude: currentLat, longitude: currentLon },
    });

    // Check user's own visibility preference
    const currentUserProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const isVisible = currentUserProfile?.locationVisibility ?? false;

    // Fetch all other users whose locationVisibility is strictly true
    const otherUsers = await prisma.userLocation.findMany({
      where: {
        userId: { not: userId },
        user: {
          profile: {
            locationVisibility: true,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profile: {
              select: {
                avatarUrl: true,
                bio: true,
              },
            },
            voiceBio: {
              select: {
                audioUrl: true,
                duration: true,
              },
            },
          },
        },
      },
    });

    // Filter strictly within 300 meters
    const MAX_RADIUS_METERS = 300;
    const nearbyUsers: any[] = [];

    for (const record of otherUsers) {
      const distance = calculateDistanceMeters(currentLat, currentLon, record.latitude, record.longitude);

      if (distance <= MAX_RADIUS_METERS) {
        // Calculate bearing / relative angle for visual radar positioning
        const dLon = ((record.longitude - currentLon) * Math.PI) / 180;
        const y = Math.sin(dLon) * Math.cos((record.latitude * Math.PI) / 180);
        const x =
          Math.cos((currentLat * Math.PI) / 180) * Math.sin((record.latitude * Math.PI) / 180) -
          Math.sin((currentLat * Math.PI) / 180) * Math.cos((record.latitude * Math.PI) / 180) * Math.cos(dLon);
        const bearingRad = Math.atan2(y, x);
        const angleDegrees = ((bearingRad * 180) / Math.PI + 360) % 360;

        nearbyUsers.push({
          id: record.user.id,
          username: record.user.username,
          fullName: record.user.fullName,
          avatarUrl: record.user.profile?.avatarUrl,
          bio: record.user.profile?.bio,
          voiceBio: record.user.voiceBio,
          distanceMeters: Math.round(distance),
          relativeDistanceRatio: distance / MAX_RADIUS_METERS, // 0 to 1 for radar plot
          angleDegrees: Math.round(angleDegrees),
          // Privacy protection: exact GPS coords are omitted from public response!
        });
      }
    }

    // Sort by closest first
    nearbyUsers.sort((a, b) => a.distanceMeters - b.distanceMeters);

    return res.json({
      success: true,
      maxRadiusMeters: MAX_RADIUS_METERS,
      userLocationVisibility: isVisible,
      count: nearbyUsers.length,
      nearbyUsers,
    });
  } catch (error: any) {
    console.error('Nearby users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate nearby users' });
  }
});

export default router;
