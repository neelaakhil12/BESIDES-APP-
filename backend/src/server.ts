import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import videosRoutes from './routes/videos.routes';
import likesRoutes from './routes/likes.routes';
import commentsRoutes from './routes/comments.routes';
import mapsRoutes from './routes/maps.routes';
import chatRoutes from './routes/chat.routes';
import exploreRoutes from './routes/explore.routes';
import musicRoutes from './routes/music.routes';
import { setupSocketHandlers } from './sockets/chat.socket';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media
const uploadsPath = path.resolve(process.env.UPLOAD_DIR || './uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Besides Social Video Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/music', musicRoutes);

// Setup WebSockets
setupSocketHandlers(io);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Besides Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO Real-time service active on port ${PORT}`);
});

export { app, server, io };
