import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  roomType: { type: String, default: 'Living room' },
  style: { type: String, default: 'Warm Minimal' },
  wallColor: { type: String, default: '#e8dfd2' },
  floorColor: { type: String, default: '#c8aa89' },
  furniture: { type: [String], default: [] },
  furnitureItems: { type: [mongoose.Schema.Types.Mixed], default: [] },
  estimatedBudget: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

export default mongoose.model('Design', designSchema);
