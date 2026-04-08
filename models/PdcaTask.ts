import mongoose from 'mongoose';

const PdcaTaskSchema = new mongoose.Schema({
  phase: {
    type: String,
    enum: ['P', 'D', 'C', 'A'],
    required: true
  },
  task: {
    type: String,
    required: true
  },
  responsible: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    default: '2568'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


export default mongoose.models.PdcaTask || mongoose.model('PdcaTask', PdcaTaskSchema);
