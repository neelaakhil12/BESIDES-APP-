// Standalone Hardcoded Mock Data Store for Vercel Client Demo
// Works 100% offline and standalone without any backend server!

export interface MockUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  isVerified?: boolean;
  profile: {
    bio: string;
    avatarUrl: string;
    locationVisibility: boolean;
    themePreference: string;
  };
  voiceBio?: {
    audioUrl: string;
    duration: number;
    waveform?: number[];
  };
  stats: {
    videos: number;
    audience: string | number;
    interests: number;
  };
}

export const MOCK_USERS: Record<string, MockUser> = {
  harshitha: {
    id: 'harshitha',
    fullName: 'Harshitha Rao',
    username: 'harshitha',
    email: 'harshitha@besides.app',
    isVerified: true,
    profile: {
      bio: 'Content Creator | Travel | Lifestyle ✨',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
      locationVisibility: true,
      themePreference: 'dark',
    },
    voiceBio: {
      audioUrl: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg',
      duration: 7.0,
      waveform: [0.3, 0.7, 0.5, 0.9, 0.4, 0.8, 0.6, 0.9, 0.4, 0.7],
    },
    stats: {
      videos: 124,
      audience: '18.4K',
      interests: 328,
    },
  },
  anusha: {
    id: 'anusha',
    fullName: 'Anusha Sharma',
    username: 'anusha',
    email: 'anusha@besides.app',
    isVerified: true,
    profile: {
      bio: 'Foodie & wanderer 🍜✈️',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
      locationVisibility: true,
      themePreference: 'dark',
    },
    voiceBio: {
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      duration: 12.0,
    },
    stats: {
      videos: 86,
      audience: '9.2K',
      interests: 195,
    },
  },
  priya: {
    id: 'priya',
    fullName: 'Priya Patel',
    username: 'priya',
    email: 'priya@besides.app',
    isVerified: true,
    profile: {
      bio: 'Music lover & dancer 💃',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
      locationVisibility: true,
      themePreference: 'dark',
    },
    voiceBio: {
      audioUrl: 'https://actions.google.com/sounds/v1/water/waves_crashing.ogg',
      duration: 9.5,
    },
    stats: {
      videos: 142,
      audience: '24.1K',
      interests: 410,
    },
  },
  rohith: {
    id: 'rohith',
    fullName: 'Rohith Verma',
    username: 'rohith',
    email: 'rohith@besides.app',
    profile: {
      bio: 'Photography & tech geek 📸',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      locationVisibility: true,
      themePreference: 'dark',
    },
    stats: {
      videos: 54,
      audience: '5.6K',
      interests: 180,
    },
  },
  vamsi: {
    id: 'vamsi',
    fullName: 'Vamsi Krishna',
    username: 'vamsi',
    email: 'vamsi@besides.app',
    isVerified: true,
    profile: {
      bio: 'Comedy sketches & vlogs 😂',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
      locationVisibility: true,
      themePreference: 'dark',
    },
    stats: {
      videos: 210,
      audience: '48.9K',
      interests: 512,
    },
  },
};

export const MOCK_VIDEOS = [
  {
    id: 'video-1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    caption: 'Vibes on point 🌸 #Travel #Vibe #Besides',
    duration: 15.0,
    viewCount: '45.2K',
    likeCount: 12400,
    commentCount: 1248,
    shareCount: 642,
    isLiked: false,
    isFollowing: false,
    user: MOCK_USERS.harshitha,
  },
  {
    id: 'video-2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
    caption: 'When you try cooking after watching one reel 😂🍳 #Comedy #Food',
    duration: 14.0,
    viewCount: '62.0K',
    likeCount: 15300,
    commentCount: 880,
    shareCount: 1200,
    isLiked: false,
    isFollowing: false,
    user: MOCK_USERS.vamsi,
  },
  {
    id: 'video-3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
    caption: 'Dancing under the neon lights ✨ #Dance #Vibe',
    duration: 12.0,
    viewCount: '31.5K',
    likeCount: 8900,
    commentCount: 410,
    shareCount: 290,
    isLiked: false,
    isFollowing: true,
    user: MOCK_USERS.priya,
  },
  {
    id: 'video-4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
    caption: 'Best street food hidden gems in Hyderabad! 🍲🍜 #Food #Travel',
    duration: 15.0,
    viewCount: '28.4K',
    likeCount: 6700,
    commentCount: 320,
    shareCount: 450,
    isLiked: false,
    isFollowing: true,
    user: MOCK_USERS.anusha,
  },
];

export const MOCK_COMMENTS = [
  {
    id: 'comment-1',
    content: 'Super video! 🔥',
    likeCount: 426,
    createdAt: '7h',
    user: MOCK_USERS.vamsi,
    replies: [],
    videoReplies: [
      {
        id: 'vr-1',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        duration: 8.0,
        user: MOCK_USERS.anusha,
      },
    ],
  },
  {
    id: 'comment-2',
    content: 'Loved this ❤️',
    likeCount: 163,
    createdAt: '3h',
    user: MOCK_USERS.anusha,
    replies: [
      {
        id: 'reply-1',
        content: 'Thank you! 🥰',
        likeCount: 52,
        createdAt: '1h',
        user: MOCK_USERS.harshitha,
      },
    ],
    videoReplies: [],
  },
];

export const MOCK_NEARBY_USERS = [
  {
    id: 'anusha',
    username: 'anusha',
    fullName: 'Anusha Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    bio: 'Foodie & wanderer 🍜✈️',
    distanceMeters: 120,
    relativeDistanceRatio: 0.4,
    angleDegrees: 55,
  },
  {
    id: 'priya',
    username: 'priya',
    fullName: 'Priya Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    bio: 'Music lover & dancer 💃',
    distanceMeters: 210,
    relativeDistanceRatio: 0.7,
    angleDegrees: 195,
  },
  {
    id: 'rohith',
    username: 'rohith',
    fullName: 'Rohith Verma',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    bio: 'Photography & tech geek 📸',
    distanceMeters: 260,
    relativeDistanceRatio: 0.85,
    angleDegrees: 280,
  },
  {
    id: 'vamsi',
    username: 'vamsi',
    fullName: 'Vamsi Krishna',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    bio: 'Comedy sketches & vlogs 😂',
    distanceMeters: 280,
    relativeDistanceRatio: 0.9,
    angleDegrees: 330,
  },
];

export const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    name: 'Priya',
    isGroup: false,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    unreadCount: 2,
    lastMessage: {
      text: 'Are we collaborating this weekend?',
      time: '9:41 PM',
    },
    messages: [
      { id: 'm1', senderId: 'priya', text: 'Hey Harshitha, loved your new reel! 💕', time: '9:30 PM' },
      { id: 'm2', senderId: 'harshitha', text: 'Thank you so much Priya!', time: '9:35 PM' },
      { id: 'm3', senderId: 'priya', text: 'Are we collaborating this weekend?', time: '9:41 PM' },
    ],
  },
  {
    id: 'conv-2',
    name: 'Team Creators',
    isGroup: true,
    avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200',
    unreadCount: 0,
    lastMessage: {
      text: 'Harish: New video idea!',
      time: '8:50 PM',
    },
    messages: [
      { id: 'm4', senderId: 'rohith', text: 'Guys, check out this concept!', time: '8:40 PM' },
      { id: 'm5', senderId: 'harshitha', text: 'Harish: New video idea!', time: '8:50 PM' },
    ],
  },
  {
    id: 'conv-3',
    name: 'Rohith',
    isGroup: false,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    unreadCount: 0,
    lastMessage: {
      text: '📷 Photo',
      time: '6:22 PM',
    },
    messages: [
      { id: 'm6', senderId: 'rohith', text: 'Here are the camera settings for the night shoot!', time: '6:20 PM' },
    ],
  },
  {
    id: 'conv-4',
    name: 'College Friends',
    isGroup: true,
    avatarUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=200',
    unreadCount: 0,
    lastMessage: {
      text: 'You: See you tomorrow!',
      time: '5:10 PM',
    },
    messages: [
      { id: 'm7', senderId: 'harshitha', text: 'See you tomorrow guys!', time: '5:10 PM' },
    ],
  },
  {
    id: 'conv-5',
    name: 'Anusha',
    isGroup: false,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    unreadCount: 0,
    lastMessage: {
      text: '📹 Video',
      time: 'Yesterday',
    },
    messages: [
      { id: 'm8', senderId: 'anusha', text: 'Check out this food reel!', time: 'Yesterday' },
    ],
  },
];

export const MOCK_TRENDING_TAGS = [
  { name: 'Travel', count: '2.4M videos', bg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300' },
  { name: 'Dance', count: '6.7M videos', bg: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=300' },
  { name: 'Comedy', count: '5.1M videos', bg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
  { name: 'Food', count: '1.9M videos', bg: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300' },
];

export const MOCK_STORIES = [
  {
    id: 'story-0',
    username: 'Your story',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    isUser: true,
    hasStory: false,
  },
  {
    id: 'story-1',
    username: 'venkatesh96328',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    hasStory: true,
  },
  {
    id: 'story-2',
    username: 'iam_naveenvan...',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    hasStory: true,
  },
  {
    id: 'story-3',
    username: '_ms.harshini_',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    hasStory: true,
  },
  {
    id: 'story-4',
    username: 'anusha',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    hasStory: true,
  },
  {
    id: 'story-5',
    username: 'priya',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    hasStory: true,
  },
  {
    id: 'story-6',
    username: 'vamsi',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    hasStory: true,
  },
];

export const MOCK_SUGGESTED_USERS = [
  {
    id: 'sug-1',
    username: 'manish_devunuri',
    fullName: 'Manish Devunuri',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    isPrivate: true,
    subtitle: 'Suggested for you',
    isFollowing: false,
  },
  {
    id: 'sug-2',
    username: 'venkatesh_yadav',
    fullName: 'Venkatesh Yadav',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    isPrivate: false,
    subtitle: 'Suggested for you',
    isFollowing: false,
  },
  {
    id: 'sug-3',
    username: 'karthik_chary',
    fullName: 'Karthik Chary',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
    isPrivate: true,
    subtitle: 'Follows you',
    isFollowing: false,
  },
  {
    id: 'sug-4',
    username: 'dr.kadari.ak',
    fullName: 'Dr. Kadari',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300',
    isPrivate: false,
    subtitle: 'Suggested for you',
    isFollowing: false,
  },
];

export const MOCK_POSTS = [
  {
    id: 'post-1',
    user: {
      username: 'priya_patel',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      isVerified: true,
    },
    location: 'Hyderabad, India',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900',
    caption: 'Golden hour magical vibes ✨ Loving every moment of this journey! 🌸 #Travel #Besides #Sunset',
    likeCount: 1420,
    commentCount: 48,
    timeAgo: '2 HOURS AGO',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-2',
    user: {
      username: 'anusha_foodie',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
      isVerified: true,
    },
    location: 'Old City, Hyderabad',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900',
    caption: 'Secret street food culinary spots you must explore! 🍲🍜 Which one is your all-time favorite? #Foodie #Hyderabad',
    likeCount: 892,
    commentCount: 34,
    timeAgo: '4 HOURS AGO',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-3',
    user: {
      username: 'vamsi_comedy',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      isVerified: false,
    },
    location: 'Tech Hub Studio',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900',
    caption: 'When you try cooking after watching one reel 😂 Drop a ❤️ if you can relate! #Comedy #Relatable #Fun',
    likeCount: 2310,
    commentCount: 88,
    timeAgo: '7 HOURS AGO',
    isLiked: false,
    isSaved: false,
  },
];

export const MOCK_INSTAGRAM_CHATS = [
  {
    id: 'ig-chat-1',
    name: 'neelasathyam',
    username: 'neelasathyam',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    lastMessage: 'Sent a reel by chanakya_yadav_kesab...',
    time: '5h',
    unread: true,
    hasStoryRing: false,
    messages: [
      { id: 'm1', senderId: 'neelasathyam', text: 'Hey bro check this out!', time: '5:15 PM' },
      { id: 'm2', senderId: 'neelasathyam', text: 'Sent a reel by chanakya_yadav_kesab...', time: '5:20 PM' },
    ],
  },
  {
    id: 'ig-chat-2',
    name: 'mahadev',
    username: 'mahadev',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    lastMessage: 'Sent on Saturday',
    time: 'Sat',
    unread: false,
    hasStoryRing: false,
    messages: [
      { id: 'm3', senderId: 'mahadev', text: 'Sent on Saturday', time: 'Saturday' },
    ],
  },
  {
    id: 'ig-chat-3',
    name: 'dr.kadari.ak',
    username: 'dr.kadari.ak',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200',
    lastMessage: 'Sent a reel by website.app_designs',
    time: '2d',
    tag: 'Request',
    unread: true,
    hasStoryRing: true,
    messages: [
      { id: 'm4', senderId: 'dr.kadari.ak', text: 'Sent a reel by website.app_designs', time: '2d' },
    ],
  },
  {
    id: 'ig-chat-4',
    name: 'Akhil neela, Instagram user',
    username: 'akhil_neela',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
    lastMessage: 'Sent on Friday',
    time: 'Fri',
    unread: false,
    hasStoryRing: false,
    messages: [
      { id: 'm5', senderId: 'akhil_neela', text: 'Sent on Friday', time: 'Friday' },
    ],
  },
  {
    id: 'ig-chat-5',
    name: 'Manish Devunuri',
    username: 'manish_devunuri',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    lastMessage: 'Sent on Thursday',
    time: 'Thu',
    unread: false,
    hasStoryRing: false,
    messages: [
      { id: 'm6', senderId: 'manish_devunuri', text: 'Sent on Thursday', time: 'Thursday' },
    ],
  },
  {
    id: 'ig-chat-6',
    name: 'Venkatesh Yadav',
    username: 'venkatesh96328',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    lastMessage: 'Sent on Thursday',
    time: 'Thu',
    unread: false,
    hasStoryRing: false,
    messages: [
      { id: 'm7', senderId: 'venkatesh96328', text: 'Sent on Thursday', time: 'Thursday' },
    ],
  },
  {
    id: 'ig-chat-7',
    name: 'Karthik Chary',
    username: 'karthik_chary',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    lastMessage: '🎤 Voice message (0:14)',
    time: '1d',
    unread: false,
    hasStoryRing: false,
    messages: [
      { id: 'm8', senderId: 'karthik_chary', text: '🎤 Voice message (0:14)', time: '1d' },
    ],
  },
  {
    id: 'ig-chat-8',
    name: 'VAMSHI EDUNURI',
    username: 'vamsi_edunuri',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    lastMessage: 'Sent on Thursday',
    time: 'Thu',
    unread: false,
    hasStoryRing: false,
    messages: [
      { id: 'm9', senderId: 'vamsi_edunuri', text: 'Sent on Thursday', time: 'Thursday' },
    ],
  },
  {
    id: 'ig-chat-9',
    name: 'Priya',
    username: 'priya',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    lastMessage: 'Are we collaborating this weekend?',
    time: '9:41 PM',
    unread: true,
    hasStoryRing: true,
    messages: [
      { id: 'm10', senderId: 'priya', text: 'Hey Harshitha, loved your new reel! 💕', time: '9:30 PM' },
      { id: 'm11', senderId: 'harshitha', text: 'Thank you so much Priya!', time: '9:35 PM' },
      { id: 'm12', senderId: 'priya', text: 'Are we collaborating this weekend?', time: '9:41 PM' },
    ],
  },
  {
    id: 'ig-chat-10',
    name: 'Anusha',
    username: 'anusha',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    lastMessage: 'Check out this food reel!',
    time: 'Yesterday',
    unread: false,
    hasStoryRing: false,
    messages: [
      { id: 'm13', senderId: 'anusha', text: 'Check out this food reel!', time: 'Yesterday' },
    ],
  },
];
