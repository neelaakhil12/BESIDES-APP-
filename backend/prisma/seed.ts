import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Besides database with rich demo data matching the UI mockup...');

  // Clean existing data
  await prisma.videoView.deleteMany();
  await prisma.videoLike.deleteMany();
  await prisma.videoReply.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.videoHashtag.deleteMany();
  await prisma.hashtag.deleteMany();
  await prisma.video.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.userLocation.deleteMany();
  await prisma.voiceBio.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.musicTrack.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Core Users matching the screenshot
  // Base coordinates around Hyderabad Tech City: lat 17.4435, lon 78.3772
  const usersData = [
    {
      fullName: 'Harshitha Rao',
      username: 'harshitha',
      email: 'harshitha@besides.app',
      bio: 'Content Creator | Travel | Lifestyle ✨',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
      lat: 17.4435,
      lon: 78.3772,
      locationVisibility: true,
      voiceDuration: 7.0,
      voiceAudio: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg',
    },
    {
      fullName: 'Anusha Sharma',
      username: 'anusha',
      email: 'anusha@besides.app',
      bio: 'Foodie & wanderer 🍜✈️',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
      // Approx 120 meters north-east of Harshitha
      lat: 17.4443,
      lon: 78.3780,
      locationVisibility: true,
      voiceDuration: 12.0,
      voiceAudio: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
    },
    {
      fullName: 'Priya Patel',
      username: 'priya',
      email: 'priya@besides.app',
      bio: 'Music lover & dancer 💃',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
      // Approx 210 meters south of Harshitha
      lat: 17.4416,
      lon: 78.3768,
      locationVisibility: true,
      voiceDuration: 9.5,
      voiceAudio: 'https://actions.google.com/sounds/v1/water/waves_crashing.ogg',
    },
    {
      fullName: 'Rohith Verma',
      username: 'rohith',
      email: 'rohith@besides.app',
      bio: 'Photography & tech geek 📸',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      // Approx 260 meters west of Harshitha
      lat: 17.4432,
      lon: 78.3747,
      locationVisibility: true,
      voiceDuration: 15.0,
      voiceAudio: 'https://actions.google.com/sounds/v1/foley/footsteps_gravel.ogg',
    },
    {
      fullName: 'Vamsi Krishna',
      username: 'vamsi',
      email: 'vamsi@besides.app',
      bio: 'Comedy sketches & vlogs 😂',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
      // Approx 280 meters north-west of Harshitha
      lat: 17.4455,
      lon: 78.3756,
      locationVisibility: true,
      voiceDuration: 8.0,
      voiceAudio: 'https://actions.google.com/sounds/v1/cartoon/boing.ogg',
    },
  ];

  const createdUsers: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        fullName: u.fullName,
        username: u.username,
        email: u.email,
        passwordHash,
        isVerified: true,
        profile: {
          create: {
            bio: u.bio,
            avatarUrl: u.avatarUrl,
            locationVisibility: u.locationVisibility,
            themePreference: 'dark',
          },
        },
        voiceBio: {
          create: {
            audioUrl: u.voiceAudio,
            duration: u.voiceDuration,
            waveform: JSON.stringify([0.3, 0.6, 0.9, 0.4, 0.8, 0.5, 0.7, 0.4, 0.9, 0.6]),
          },
        },
        userLocation: {
          create: {
            latitude: u.lat,
            longitude: u.lon,
          },
        },
      },
      include: { profile: true },
    });
    createdUsers[u.username] = user;
  }

  // 2. Follow relationships
  await prisma.follow.create({ data: { followerId: createdUsers['harshitha'].id, followingId: createdUsers['anusha'].id } });
  await prisma.follow.create({ data: { followerId: createdUsers['harshitha'].id, followingId: createdUsers['priya'].id } });
  await prisma.follow.create({ data: { followerId: createdUsers['anusha'].id, followingId: createdUsers['harshitha'].id } });
  await prisma.follow.create({ data: { followerId: createdUsers['vamsi'].id, followingId: createdUsers['harshitha'].id } });
  await prisma.follow.create({ data: { followerId: createdUsers['rohith'].id, followingId: createdUsers['harshitha'].id } });

  // 3. Trending Hashtags
  const hashtags = [
    { name: 'travel', videoCount: 2400000 },
    { name: 'dance', videoCount: 6700000 },
    { name: 'comedy', videoCount: 5100000 },
    { name: 'food', videoCount: 1900000 },
    { name: 'vibe', videoCount: 3200000 },
    { name: 'besides', videoCount: 950000 },
  ];

  const createdTags: Record<string, any> = {};
  for (const h of hashtags) {
    createdTags[h.name] = await prisma.hashtag.create({ data: h });
  }

  // 4. Sample Videos matching the screenshot
  const video1 = await prisma.video.create({
    data: {
      userId: createdUsers['harshitha'].id,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
      caption: 'Vibes on point 🌸 #Travel #Vibe #Besides',
      duration: 15.0,
      likeCount: 12400,
      commentCount: 1248,
      shareCount: 642,
      viewCount: 45000,
    },
  });

  const video2 = await prisma.video.create({
    data: {
      userId: createdUsers['priya'].id,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
      caption: 'Dancing under the neon lights ✨ #Dance #Vibe',
      duration: 12.0,
      likeCount: 8900,
      commentCount: 410,
      shareCount: 290,
      viewCount: 31000,
    },
  });

  const video3 = await prisma.video.create({
    data: {
      userId: createdUsers['vamsi'].id,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
      caption: 'When you try cooking after watching one reel 😂🍳 #Comedy #Food',
      duration: 14.0,
      likeCount: 15300,
      commentCount: 880,
      shareCount: 1200,
      viewCount: 62000,
    },
  });

  // Link hashtags to video1
  await prisma.videoHashtag.create({ data: { videoId: video1.id, hashtagId: createdTags['travel'].id } });
  await prisma.videoHashtag.create({ data: { videoId: video1.id, hashtagId: createdTags['vibe'].id } });
  await prisma.videoHashtag.create({ data: { videoId: video1.id, hashtagId: createdTags['besides'].id } });

  // 5. Comments & Video Reply (<= 10s) on Videos matching screenshot
  for (const v of [video1, video2, video3]) {
    const comment1 = await prisma.comment.create({
      data: {
        userId: createdUsers['vamsi'].id,
        videoId: v.id,
        content: 'Super video! 🔥',
        likeCount: 426,
      },
    });

    const comment2 = await prisma.comment.create({
      data: {
        userId: createdUsers['anusha'].id,
        videoId: v.id,
        content: 'Loved this ❤️',
        likeCount: 163,
      },
    });

    // Creator reply to comment2
    await prisma.comment.create({
      data: {
        userId: v.userId,
        videoId: v.id,
        parentCommentId: comment2.id,
        content: 'Thank you! 🥰',
        likeCount: 52,
      },
    });

    // Dedicated Video Reply (<= 10s) attached to comment1
    await prisma.videoReply.create({
      data: {
        userId: createdUsers['anusha'].id,
        commentId: comment1.id,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
        duration: 8.0, // 8 seconds, strictly <= 10s
      },
    });
  }

  // 6. Direct & Group Conversations
  // Direct chat with Priya
  const convPriya = await prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [
          { userId: createdUsers['harshitha'].id, role: 'member' },
          { userId: createdUsers['priya'].id, role: 'member', unreadCount: 2 },
        ],
      },
      messages: {
        create: [
          { senderId: createdUsers['priya'].id, text: 'Hey Harshitha, loved your new reel!' },
          { senderId: createdUsers['harshitha'].id, text: 'Thank you so much Priya! 💕' },
          { senderId: createdUsers['priya'].id, text: 'Are we collaborating this weekend?' },
        ],
      },
    },
  });

  // Group chat: "Team Creators"
  const groupTeam = await prisma.conversation.create({
    data: {
      isGroup: true,
      name: 'Team Creators',
      avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300',
      members: {
        create: [
          { userId: createdUsers['harshitha'].id, role: 'admin' },
          { userId: createdUsers['priya'].id, role: 'member' },
          { userId: createdUsers['rohith'].id, role: 'member' },
          { userId: createdUsers['vamsi'].id, role: 'member' },
        ],
      },
      messages: {
        create: [
          { senderId: createdUsers['rohith'].id, text: 'Guys, check out this video concept!' },
          { senderId: createdUsers['harshitha'].id, text: 'New video idea dropping tomorrow evening 🔥' },
        ],
      },
    },
  });

  // 7. Royalty-free music library for Video Editor
  const musicTracks = [
    { title: 'Neon Night City', artist: 'Besides Beats', duration: 30.0, audioUrl: 'https://actions.google.com/sounds/v1/transportation/car_horn.ogg' },
    { title: 'Midnight Chill Wave', artist: 'Luna Glow', duration: 45.0, audioUrl: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg' },
    { title: 'Tropical Sunrise', artist: 'Sol Breeze', duration: 28.0, audioUrl: 'https://actions.google.com/sounds/v1/weather/wind_breeze.ogg' },
    { title: 'Cyber Pulse', artist: 'Volt Drive', duration: 35.0, audioUrl: 'https://actions.google.com/sounds/v1/science_fiction/teleport.ogg' },
  ];

  for (const track of musicTracks) {
    await prisma.musicTrack.create({ data: track });
  }

  console.log('✅ Database successfully seeded with 5 users, videos, voice bios, 300m nearby locations, and chats!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
