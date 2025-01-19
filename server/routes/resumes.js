import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Update user's resume
router.post('/upload', auth, async (req, res) => {
  try {
    const { resumeUrl, parsedContent } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        'profile.resume': {
          url: resumeUrl,
          parsedContent,
        },
      },
      { new: true }
    );

    res.json(user.profile.resume);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;