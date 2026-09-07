import path from 'path';
import fs from 'fs';
import Packing from '../models/Packing.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { UPLOAD_DIR } from '../middleware/upload.js';

const USER_FIELDS = 'name';

export const getAll = asyncHandler(async (req, res) => {
  const items = await Packing.find()
    .sort({ order: 1, createdAt: 1 })
    .populate('createdBy', USER_FIELDS)
    .populate('updatedBy', USER_FIELDS)
    .lean();
  res.json({ items });
});

export const create = asyncHandler(async (req, res) => {
  const { title, description, brandName, location, date, who, paymentMethod, itemQty, cost, status, notes, order } =
    req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const item = await Packing.create({
    title,
    description,
    brandName,
    location,
    date: date || null,
    who,
    paymentMethod,
    itemQty,
    cost,
    status,
    notes,
    order: order ?? (await Packing.countDocuments()),
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });
  await item.populate([
    { path: 'createdBy', select: USER_FIELDS },
    { path: 'updatedBy', select: USER_FIELDS },
  ]);

  res.status(201).json({ item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await Packing.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const directFields = [
    'title',
    'description',
    'brandName',
    'location',
    'who',
    'paymentMethod',
    'itemQty',
    'cost',
    'status',
    'notes',
    'order',
  ];
  directFields.forEach((field) => {
    if (req.body[field] !== undefined) item[field] = req.body[field];
  });
  if (req.body.date !== undefined) {
    item.date = req.body.date || null;
  }
  item.updatedBy = req.user._id;

  await item.save();
  await item.populate([
    { path: 'createdBy', select: USER_FIELDS },
    { path: 'updatedBy', select: USER_FIELDS },
  ]);
  res.json({ item });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Packing.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  await item.deleteOne();
  res.json({ message: 'Item deleted' });
});

export const uploadAttachment = asyncHandler(async (req, res) => {
  const item = await Packing.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  item.attachments.push({
    fileName: req.file.originalname,
    filePath: `/uploads/${req.file.filename}`,
  });
  item.updatedBy = req.user._id;
  await item.save();

  res.status(201).json({ item });
});

export const deleteAttachment = asyncHandler(async (req, res) => {
  const item = await Packing.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const attachment = item.attachments.find((a) => a._id?.toString() === req.params.attachmentId);
  item.attachments = item.attachments.filter((a) => a._id?.toString() !== req.params.attachmentId);
  await item.save();

  if (attachment) {
    const filePath = path.join(UPLOAD_DIR, path.basename(attachment.filePath));
    fs.unlink(filePath, () => {});
  }

  res.json({ item });
});
