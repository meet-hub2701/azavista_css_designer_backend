import express from 'express';
import { analyzeWebsite } from '../services/websiteAnalyzer.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const analysis = await analyzeWebsite(url);
    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze website' });
  }
});

export default router;
