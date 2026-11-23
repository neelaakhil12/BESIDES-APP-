# Besides – Social Media Mobile Application (Version 1.0.0 MVP)

> **Short Videos · People · Nearby**

Besides is a modern, high-performance social media mobile application built for Android, iOS, and Web preview. It is inspired by TikTok and Instagram, with unique core innovations including **Profile Voice Bios**, **10-Second Video Comment Replies**, and an interactive **300-Metre Nearby User Radar Map**.

---

## 📱 Visual Blueprint & UI Design System
The design strictly follows the official Beside V1 (MVP) blueprint:
- **Brand Colors**: Vivid Neon Magenta/Pink (`#E0287D`), Deep Violet (`#8A2BE2`), Neon Cyan (`#00F2FE`), Deep OLED Background (`#0B0814`).
- **Dual Themes**: Complete Light Mode (`#F8F9FE`) and Dark Mode (`#0B0814`) with seamless dynamic switching.
- **Desktop Mobile Frame Preview**: When opened in a desktop web browser, the app renders inside a realistic luxury smartphone bezel with curved glass corners, a Dynamic Island / punch-hole camera, status bar (9:41, WiFi, 5G, battery), and a bottom home indicator bar.
- **Android Compatibility (3-Button & Gestures)**: Strict integration with `react-native-safe-area-context` ensures the top status bar and bottom Android navigation bar (both 3-button navigation and gesture pills) never overlap, cut off, or disturb bottom tabs or action buttons.

---

## 🛠️ Technology Stack

### Mobile Frontend (`mobile/`)
- **Framework**: React Native with Expo (SDK 52)
- **Language**: TypeScript
- **Icons**: Lucide React Native
- **Media**: Expo AV (Video playback & Audio voice recording/playback), Expo Linear Gradient
- **Responsive Frame**: Custom Adaptive Smartphone Frame (`MobileFrame.tsx`) with safe-area protection for all Android & iOS form factors.
- **State & Real-Time**: Context API (`AuthContext`, `ThemeContext`), Axios, Socket.IO Client.

### Backend & API Server (`backend/`)
- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database & ORM**: Prisma ORM with SQLite (instant zero-config local testing) + PostgreSQL/PostGIS schema readiness.
- **Real-Time Communication**: Socket.IO for instant direct chat, group messaging, and live online status.
- **Authentication**: JWT access tokens + refresh token rotation with password hashing (bcryptjs).
- **File Storage**: Local & Cloud-ready multi-part media upload handler (`/uploads`).
- **Geospatial Engine**: Backend Haversine distance algorithm calculating user proximity within 300 meters, strictly filtering by user consent (`locationVisibility = true`).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

---

### 2. Run the Backend API Server
```powershell
# Navigate to the backend directory
cd backend

# Install dependencies (already pre-installed)
npm install

# Initialize and seed database with rich demo data
npm run prisma:push
npm run prisma:seed

# Start the server (runs on http://localhost:5000)
npm run dev
# or for production:
npm start
```

#### Seeded Demo Accounts:
All seeded users have password: `password123`
- `harshitha` (Harshitha Rao - Creator with 124 videos, 18.4K followers, Voice Bio)
- `anusha` (Anusha Sharma - Located 120m away from Harshitha on Radar Map)
- `priya` (Priya Patel - Music lover & dancer, 210m away)
- `rohith` (Rohith Verma - Tech & photo creator, 260m away)
- `vamsi` (Vamsi Krishna - Comedy creator, 280m away)

---

### 3. Run the Mobile Application
```powershell
# Navigate to the mobile directory
cd mobile

# Start Web / Desktop preview (renders inside the sleek Mobile Frame)
npm run web

# Or run on Android device / emulator
npm run android

# Or run on iOS simulator
npm run ios
```

---

## 📦 Implemented V1 (MVP) Features Breakdown

| Module | Feature | Implementation Details |
| :--- | :--- | :--- |
| **01. Authentication** | Register, Login, Forgot Password | Email/username uniqueness, bcrypt hashing, JWT access/refresh tokens, validation |
| **02. Home Video Feed** | Full-Screen Vertical Feed | Auto-play on scroll, swipe gesture, mute/unmute, like/comment counts, creator follow badge |
| **03. Comments & Video Replies** | 10s Video Replies & Nested Threads | Text comments, nested replies, dedicated **Video Reply (≤ 10s)** card with duration badge |
| **04. Explore & Search** | Discovery, Trending & Search | Trending hashtags (#Travel, #Dance, #Comedy, #Food), search users/videos, discovery grid |
| **05. Chat & Real-Time Messaging** | 1-1 & Group Chats | Socket.IO live delivery, All/Direct/Groups tabs, media sharing, unread badges |
| **06. User Profile (Me)** | Profile & Stats | Audience/Interests stats, Moments video grid, Replies tab, Edit Profile |
| **07. Voice Bio** | Voice Recording & Playback | Profile audio pill player with animated waveform, duration (0:07), recorder modal (≤ 30s) |
| **08. Maps Page (300m Radar)** | Nearby User Discovery | 300m concentric radar, Show My Location toggle, distance calculation (120m away), profile preview card |
| **09. Video Creation & Editor** | Video Recording & Editing | Scrubber timeline (0:00/0:15), Trim, Filters, Adjust, Text, Music library, Speed, Caption & Publish |
| **10. Account Settings** | Preferences & Privacy | Location Visibility toggle, Theme selector (Dark/Light/System), Account, Privacy, Logout |

---

## 🌐 Production PostgreSQL & PostGIS Migration
To switch the backend to PostgreSQL in production:
1. Update `backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/besides_db?schema=public"
   ```
2. In `backend/prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run `npx prisma migrate dev --name init`.
