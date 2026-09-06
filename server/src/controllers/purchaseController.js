import path from 'path';
import fs from 'fs';
import Purchase from '../models/Purchase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { UPLOAD_DIR } from '../middleware/upload.js';

export const getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find().sort({ createdAt: -1 }).populate('linkedStep', 'title');
  res.json({ purchases });
});

export const createPurchase = asyncHandler(async (req, res) => {
  const { itemName, category, quantity, unitCost, vendor, purchaseDate, status, notes, linkedStep } =
    req.body;

  if (!itemName) {
    return res.status(400).json({ message: 'Item name is required' });
  }

  const purchase = await Purchase.create({
    itemName,
    category,
    quantity,
    unitCost,
    vendor,
    purchaseDate: purchaseDate || null,
    status,
    notes,
    linkedStep: linkedStep || null,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json({ purchase });
});

export const updatePurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) {
    return res.status(404).json({ message: 'Purchase not found' });
  }

  const directFields = ['itemName', 'category', 'quantity', 'unitCost', 'vendor', 'status', 'notes'];
  directFields.forEach((field) => {
    if (req.body[field] !== undefined) purchase[field] = req.body[field];
  });
  const nullableFields = ['purchaseDate', 'linkedStep'];
  nullableFields.forEach((field) => {
    if (req.body[field] !== undefined) purchase[field] = req.body[field] || null;
  });
  purchase.updatedBy = req.user._id;

  await purchase.save();
  res.json({ purchase });
});

export const deletePurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) {
    return res.status(404).json({ message: 'Purchase not found' });
  }
  await purchase.deleteOne();
  res.json({ message: 'Purchase deleted' });
});

export const uploadPurchaseAttachment = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) {
    return res.status(404).json({ message: 'Purchase not found' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  purchase.attachments.push({
    fileName: req.file.originalname,
    filePath: `/uploads/${req.file.filename}`,
  });
  purchase.updatedBy = req.user._id;
  await purchase.save();

  res.status(201).json({ purchase });
});

export const deletePurchaseAttachment = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) {
    return res.status(404).json({ message: 'Purchase not found' });
  }

  const attachment = purchase.attachments.find(
    (a) => a._id?.toString() === req.params.attachmentId
  );
  purchase.attachments = purchase.attachments.filter(
    (a) => a._id?.toString() !== req.params.attachmentId
  );
  await purchase.save();

  if (attachment) {
    const filePath = path.join(UPLOAD_DIR, path.basename(attachment.filePath));
    fs.unlink(filePath, () => {});
  }

  res.json({ purchase });
});
