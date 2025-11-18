import express from 'express';
import { fetchWebsiteHTML, injectCustomCSS } from '../services/websiteProxy.js';

const router = express.Router();

// Fetch website with custom CSS injected
router.post('/fetch', async (req, res) => {
  try {
    const { url, customCSS } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }
    
    // Fetch the website HTML
    const html = await fetchWebsiteHTML(url);
    
    // Inject custom CSS if provided
    const modifiedHTML = customCSS 
      ? injectCustomCSS(html, customCSS, url)
      : html;
    
    // Return HTML with proper content type
    res.setHeader('Content-Type', 'text/html');
    res.send(modifiedHTML);
  } catch (error: any) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch website',
      error: error.message 
    });
  }
});

export default router;
