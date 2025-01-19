import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  status: {
    type: String,
    enum: ['applied', 'contacted', 'rejected', 'accepted'],
    default: 'applied',
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  lastContactDate: Date,
  customizedResume: String,
  notes: String,
});

export default mongoose.model('Application', applicationSchema);