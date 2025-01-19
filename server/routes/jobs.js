import express from 'express';
import { auth } from '../middleware/auth.js';
import Job from '../models/Job.js';

const router = express.Router();

// Get all jobs with filtering
router.get('/', auth, async (req, res) => {
  try {
    const { keywords, location, remote, type } = req.query;
    const query = {};

    if (keywords) {
      query.$or = [
        { title: { $regex: keywords, $options: 'i' } },
        { description: { $regex: keywords, $options: 'i' } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (remote === 'true') {
      query.$or = [
        { location: /remote/i },
        { type: /remote/i },
      ];
    }

    if (type) {
      query.type = { $regex: type, $options: 'i' };
    }

    const jobs = await Job.find(query).sort({ posted: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;