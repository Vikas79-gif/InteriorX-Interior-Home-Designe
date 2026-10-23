import { Router } from 'express';
import mongoose from 'mongoose';
import Design from '../models/Design.js';

const router = Router();
const dbReady = (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database is not connected. Configure MONGODB_URI in server/.env.' });
  }
  next();
};

router.get('/', dbReady, async (_req, res, next) => {
  try {
    const designs = await Design.find().sort({ createdAt: -1 }).lean();
    res.json(designs);
  } catch (err) { next(err); }
});

router.post('/', dbReady, async (req, res, next) => {
  try {
    const payload = {
      name: String(req.body.name || 'Untitled room').trim().slice(0, 100),
      roomType: req.body.roomType,
      style: req.body.style,
      wallColor: req.body.wallColor,
      floorColor: req.body.floorColor,
      furniture: Array.isArray(req.body.furniture) ? req.body.furniture : [],
      furnitureItems: Array.isArray(req.body.furnitureItems) ? req.body.furnitureItems : [],
      estimatedBudget: Math.max(0, Number(req.body.estimatedBudget) || 0)
    };
    const design = await Design.create(payload);
    res.status(201).json(design);
  } catch (err) { next(err); }
});

router.put('/:id', dbReady, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid design ID.' });
    const design = await Design.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!design) return res.status(404).json({ message: 'Design not found.' });
    res.json(design);
  } catch (err) { next(err); }
});

router.delete('/:id', dbReady, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid design ID.' });
    const design = await Design.findByIdAndDelete(req.params.id);
    if (!design) return res.status(404).json({ message: 'Design not found.' });
    res.json({ message: 'Design deleted.' });
  } catch (err) { next(err); }
});

export default router;
