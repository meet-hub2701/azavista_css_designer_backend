import express from 'express';
import Theme from '../models/Theme.js';
import Section from '../models/Section.js';
import { exportThemeAsCSS, exportThemeAsJSON } from '../services/themeExporter.js';

const router = express.Router();

// Get all themes
router.get('/', async (req, res) => {
  try {
    const themes = await Theme.find().sort({ createdAt: -1 });
    res.json(themes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single theme with sections
router.get('/:id', async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    const sections = await Section.find({ themeId: req.params.id }).sort({ order: 1 });
    res.json({ ...theme.toObject(), sections });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create theme
router.post('/', async (req, res) => {
  try {
    const theme = new Theme(req.body);
    await theme.save();
    res.status(201).json(theme);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update theme
router.put('/:id', async (req, res) => {
  try {
    const theme = await Theme.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete theme
router.delete('/:id', async (req, res) => {
  try {
    const theme = await Theme.findByIdAndDelete(req.params.id);
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // Delete all sections
    await Section.deleteMany({ themeId: req.params.id });
    
    res.json({ message: 'Theme deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Duplicate theme
router.post('/:id/duplicate', async (req, res) => {
  try {
    const originalTheme = await Theme.findById(req.params.id);
    
    if (!originalTheme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // Create new theme
    const newTheme = new Theme({
      ...originalTheme.toObject(),
      _id: undefined,
      name: `${originalTheme.name} (Copy)`,
      createdAt: undefined,
      updatedAt: undefined,
    });
    
    await newTheme.save();
    
    // Duplicate sections
    const originalSections = await Section.find({ themeId: req.params.id });
    const newSections = originalSections.map(section => ({
      ...section.toObject(),
      _id: undefined,
      themeId: newTheme._id,
      createdAt: undefined,
      updatedAt: undefined,
    }));
    
    await Section.insertMany(newSections);
    
    res.status(201).json(newTheme);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Export theme as CSS
router.get('/:id/export/css', async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    const sections = await Section.find({ themeId: req.params.id }).sort({ order: 1 });
    const css = exportThemeAsCSS(theme, sections);
    
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Content-Disposition', `attachment; filename="${theme.name.replace(/\s+/g, '-').toLowerCase()}.css"`);
    res.send(css);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Export theme as JSON
router.get('/:id/export/json', async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    const sections = await Section.find({ themeId: req.params.id }).sort({ order: 1 });
    const json = exportThemeAsJSON(theme, sections);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${theme.name.replace(/\s+/g, '-').toLowerCase()}.json"`);
    res.json(json);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create theme from URL (analyze website and auto-create sections)
router.post('/from-url', async (req, res) => {
  try {
    const { url, name } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    // Import services
    const { extractCompleteWebsite, extractCSSFromWebsite } = await import('../services/websiteProxy.js');
    
    // Extract HTML and CSS from website (like n8n HTTP node!)
    console.log('Extracting website:', url);
    const extracted = await extractCompleteWebsite(url);
    console.log('Extraction complete, HTML length:', extracted.html.length);
    
    // Quick analysis from extracted HTML (no Puppeteer needed!)
    const analysis = extractCSSFromWebsite(extracted.html);
    console.log('Analysis complete:', analysis.selectors.length, 'selectors found');
    
    // Create theme with extracted HTML/CSS
    const theme = new Theme({
      name: name || `Theme from ${new URL(url).hostname}`,
      description: `Auto-generated from ${url}`,
      sourceUrl: url,
      extractedHtml: extracted.html,
      extractedCss: extracted.css,
      globalStyles: {
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
        baseFontSize: '16px',
        backgroundColor: '#ffffff',
        textColor: '#212529',
      },
    });
    
    await theme.save();
    
    // Create sections based on actual analysis
    const sections = [];
    let order = 0;
    
    // Find section types from analysis
    const foundTypes = new Set(analysis.selectors.map(s => s.type));
    
    // Create header section if headers found
    if (foundTypes.has('header') || analysis.selectors.some(s => s.type === 'header')) {
      const section = new Section({
        themeId: theme._id,
        name: `Header from ${new URL(url).hostname}`,
        type: 'header',
        cssProperties: {
          colors: {
            background: '#ffffff',
            text: '#212529',
            border: '#dee2e6',
            hover: '#007bff',
          },
          typography: {
            fontSize: '24px',
            fontWeight: '700',
            lineHeight: '1.2',
            letterSpacing: '0',
          },
          spacing: {
            padding: '1.5rem',
            margin: '0',
            gap: '1rem',
          },
          borders: {
            radius: '0',
            width: '0',
            style: 'none',
          },
          effects: {
            shadow: 'none',
            transition: 'all 0.3s ease',
          },
        },
        customCSS: `/* Selectors found: ${analysis.selectors.filter(s => s.type === 'header').map(s => s.selector).slice(0, 3).join(', ')} */`,
        isActive: true,
        order: order++,
      });
      await section.save();
      sections.push(section);
    }
    
    // Create button section if buttons found
    if (foundTypes.has('button') || analysis.selectors.some(s => s.type === 'button')) {
      const section = new Section({
        themeId: theme._id,
        name: `Buttons from ${new URL(url).hostname}`,
        type: 'button',
        cssProperties: {
          colors: {
            background: '#007bff',
            text: '#ffffff',
            border: '#007bff',
            hover: '#0056b3',
          },
          typography: {
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '0',
          },
          spacing: {
            padding: '0.5rem 1rem',
            margin: '0',
            gap: '0.5rem',
          },
          borders: {
            radius: '0.375rem',
            width: '1px',
            style: 'solid',
          },
          effects: {
            shadow: 'none',
            transition: 'all 0.3s ease',
          },
        },
        customCSS: `/* Selectors found: ${analysis.selectors.filter(s => s.type === 'button').map(s => s.selector).slice(0, 3).join(', ')} */`,
        isActive: true,
        order: order++,
      });
      await section.save();
      sections.push(section);
    }
    
    // Create card section if cards found
    if (foundTypes.has('card') || analysis.selectors.some(s => s.type === 'card')) {
      const section = new Section({
        themeId: theme._id,
        name: `Cards from ${new URL(url).hostname}`,
        type: 'card',
        cssProperties: {
          colors: {
            background: '#ffffff',
            text: '#212529',
            border: '#dee2e6',
            hover: '#f8f9fa',
          },
          typography: {
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '0',
          },
          spacing: {
            padding: '1rem',
            margin: '0',
            gap: '1rem',
          },
          borders: {
            radius: '0.375rem',
            width: '1px',
            style: 'solid',
          },
          effects: {
            shadow: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
            transition: 'all 0.3s ease',
          },
        },
        customCSS: `/* Selectors found: ${analysis.selectors.filter(s => s.type === 'card').map(s => s.selector).slice(0, 3).join(', ')} */`,
        isActive: true,
        order: order++,
      });
      await section.save();
      sections.push(section);
    }
    
    // Create form section if forms found
    if (foundTypes.has('form') || analysis.selectors.some(s => s.type === 'form')) {
      const section = new Section({
        themeId: theme._id,
        name: `Forms from ${new URL(url).hostname}`,
        type: 'form',
        cssProperties: {
          colors: {
            background: '#ffffff',
            text: '#212529',
            border: '#ced4da',
            hover: '#80bdff',
          },
          typography: {
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '0',
          },
          spacing: {
            padding: '0.375rem 0.75rem',
            margin: '0',
            gap: '0.5rem',
          },
          borders: {
            radius: '0.375rem',
            width: '1px',
            style: 'solid',
          },
          effects: {
            shadow: 'none',
            transition: 'border-color 0.15s ease-in-out',
          },
        },
        customCSS: `/* Selectors found: ${analysis.selectors.filter(s => s.type === 'form').map(s => s.selector).slice(0, 3).join(', ')} */`,
        isActive: true,
        order: order++,
      });
      await section.save();
      sections.push(section);
    }
    
    // Create navigation section if nav found
    if (foundTypes.has('navigation') || analysis.selectors.some(s => s.type === 'navigation')) {
      const section = new Section({
        themeId: theme._id,
        name: `Navigation from ${new URL(url).hostname}`,
        type: 'navigation',
        cssProperties: {
          colors: {
            background: '#f8f9fa',
            text: '#212529',
            border: '#dee2e6',
            hover: '#007bff',
          },
          typography: {
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '0',
          },
          spacing: {
            padding: '0.5rem 1rem',
            margin: '0',
            gap: '1rem',
          },
          borders: {
            radius: '0',
            width: '0',
            style: 'none',
          },
          effects: {
            shadow: 'none',
            transition: 'all 0.3s ease',
          },
        },
        customCSS: `/* Selectors found: ${analysis.selectors.filter(s => s.type === 'navigation').map(s => s.selector).slice(0, 3).join(', ')} */`,
        isActive: true,
        order: order++,
      });
      await section.save();
      sections.push(section);
    }
    
    // If no sections were created, create default ones
    if (sections.length === 0) {
      const defaultSection = new Section({
        themeId: theme._id,
        name: 'Default Section',
        type: 'custom',
        cssProperties: {
          colors: {
            background: '#ffffff',
            text: '#212529',
            border: '#dee2e6',
            hover: '#007bff',
          },
          typography: {
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '0',
          },
          spacing: {
            padding: '1rem',
            margin: '0',
            gap: '1rem',
          },
          borders: {
            radius: '0.375rem',
            width: '1px',
            style: 'solid',
          },
          effects: {
            shadow: 'none',
            transition: 'all 0.3s ease',
          },
        },
        customCSS: '/* No elements found on the website */',
        isActive: true,
        order: 0,
      });
      await defaultSection.save();
      sections.push(defaultSection);
    }
    
    res.status(201).json({
      theme,
      sections,
      message: `Created ${sections.length} sections based on website analysis`,
    });
  } catch (error: any) {
    console.error('Error creating theme from URL:', error);
    res.status(500).json({ 
      message: 'Failed to create theme from URL',
      error: error.message 
    });
  }
});

export default router;
