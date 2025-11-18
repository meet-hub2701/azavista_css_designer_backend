import express from 'express';
import Section from '../models/Section.js';

const router = express.Router();

// Get all sections for a theme
router.get('/theme/:themeId', async (req, res) => {
  try {
    const sections = await Section.find({ themeId: req.params.themeId }).sort({ order: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single section
router.get('/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create section
router.post('/theme/:themeId', async (req, res) => {
  try {
    const maxOrder = await Section.findOne({ themeId: req.params.themeId })
      .sort({ order: -1 })
      .select('order');
    
    const section = new Section({
      ...req.body,
      themeId: req.params.themeId,
      order: maxOrder ? maxOrder.order + 1 : 0,
    });
    
    await section.save();
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update section
router.put('/:id', async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete section
router.delete('/:id', async (req, res) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    res.json({ message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reorder sections
router.put('/:id/order', async (req, res) => {
  try {
    const { newOrder } = req.body;
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { order: newOrder },
      { new: true }
    );
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
