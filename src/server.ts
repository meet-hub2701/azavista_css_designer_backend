import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import themeRoutes from './routes/themes.js';
import sectionsRoutes from './routes/sections.js';
import analysisRoutes from './routes/analysis.js';
import proxyRoutes from './routes/proxy.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow frontend domain
const allowedOrigins = [
  'http://localhost:3000',
  'https://azavista-css-designer-frontend.vercel.app',
  process.env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

// Routes
app.use('/api/themes', themeRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/proxy', proxyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/styleforge')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;
