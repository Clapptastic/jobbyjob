import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: String,
  salary: String,
  description: String,
  requirements: [String],
  posted: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    required: true,
  },
  sourceUrl: String,
  active: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model('Job', jobSchema);