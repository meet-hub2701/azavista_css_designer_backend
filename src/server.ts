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

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
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
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
