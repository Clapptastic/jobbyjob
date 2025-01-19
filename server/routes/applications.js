import express from 'express';
import { auth } from '../middleware/auth.js';
import Application from '../models/Application.js';

const router = express.Router();

// Get all applications for user
router.get('/', auth, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.userId })
      .populate('job')
      .sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new application
router.post('/', auth, async (req, res) => {
  try {
    const { jobId, customizedResume, notes } = req.body;
    
    const application = new Application({
      user: req.user.userId,
      job: jobId,
      customizedResume,
      notes,
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status, notes, lastContactDate } = req.body;
    
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { status, notes, lastContactDate },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;