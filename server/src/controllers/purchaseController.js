import path from 'path';
import fs from 'fs';
import Purchase from '../models/Purchase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { UPLOAD_DIR } from '../middleware/upload.js';

export const getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find().sort({ createdAt: -1 });
  res.json({ purchases });
});

// Keeps only rows where a product name was actually typed, and coerces
// quantity/totalAmount to numbers -- form inputs send strings.
const sanitizeItems = (items) =>
  (Array.isArray(items) ? items : [])
    .filter((i) => i?.productName?.trim())
    .map((i) => ({
      productName: i.productName.trim(),
      quantity: Number(i.quantity) || 0,
      totalAmount: Number(i.totalAmount) || 0,
    }));

export const createPurchase = asyncHandler(async (req, res) => {
  const { vendorName, location, purchaseDate, purchasedBy, paymentMethod, items, notes } = req.body;

  if (!vendorName) {
    return res.status(400).json({ message: 'Vendor name is required' });
  }
  const cleanItems = sanitizeItems(items);
  if (cleanItems.length === 0) {
    return res.status(400).json({ message: 'At least one product is required' });
  }

  const purchase = await Purchase.create({
    vendorName,
    location,
    purchaseDate: purchaseDate || null,
    purchasedBy,
    paymentMethod,
    items: cleanItems,
    notes,
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

  const directFields = ['vendorName', 'location', 'purchasedBy', 'paymentMethod', 'notes'];
  directFields.forEach((field) => {
    if (req.body[field] !== undefined) purchase[field] = req.body[field];
  });
  if (req.body.purchaseDate !== undefined) {
    purchase.purchaseDate = req.body.purchaseDate || null;
  }
  if (req.body.items !== undefined) {
    purchase.items = sanitizeItems(req.body.items);
  }
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
