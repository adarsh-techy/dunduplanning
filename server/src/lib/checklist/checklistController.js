import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { UPLOAD_DIR } from '../../middleware/upload.js';

const USER_FIELDS = 'name';

// Applies who/when completion metadata onto an item being created or
// updated. Both `completedDate` and `completedBy` (a plain name -- anyone,
// not just registered users) can be set explicitly; either falls back to a
// sensible default (now / whoever is making the request) when left blank.
const applyCompletionMeta = (item, body, actingUser) => {
  if (body.status !== undefined) {
    if (body.status === 'complete') {
      item.completedDate = body.completedDate ? new Date(body.completedDate) : item.completedDate || new Date();
      item.completedBy = (body.completedBy || '').trim() || actingUser.name;
    } else {
      item.completedDate = null;
      item.completedBy = '';
    }
  } else if (item.status === 'complete') {
    // Status isn't changing, but the completion time/owner is being edited directly.
    if (body.completedDate !== undefined) {
      item.completedDate = body.completedDate ? new Date(body.completedDate) : null;
    }
    if (body.completedBy !== undefined) {
      item.completedBy = (body.completedBy || '').trim() || actingUser.name;
    }
  }
};

// Builds the standard CRUD + attachment controller shared by every
// checklist-style module (Planning, Marketing, Features, Delivery).
export const createChecklistController = (Model) => ({
  getAll: asyncHandler(async (req, res) => {
    const items = await Model.find()
      .sort({ order: 1, createdAt: 1 })
      .populate('createdBy', USER_FIELDS)
      .populate('updatedBy', USER_FIELDS);
    res.json({ items });
  }),

  create: asyncHandler(async (req, res) => {
    const { title, category, description, status, estimatedCost, actualCost, dueDate, notes, order } =
      req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const item = new Model({
      title,
      category,
      description,
      status,
      estimatedCost,
      actualCost,
      dueDate: dueDate || null,
      notes,
      order: order ?? (await Model.countDocuments()),
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    applyCompletionMeta(item, req.body, req.user);
    await item.save();
    await item.populate([
      { path: 'createdBy', select: USER_FIELDS },
      { path: 'updatedBy', select: USER_FIELDS },
    ]);

    res.status(201).json({ item });
  }),

  update: asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const fields = [
      'title',
      'category',
      'description',
      'status',
      'estimatedCost',
      'actualCost',
      'dueDate',
      'notes',
      'order',
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });
    applyCompletionMeta(item, req.body, req.user);
    item.updatedBy = req.user._id;

    await item.save();
    await item.populate([
      { path: 'createdBy', select: USER_FIELDS },
      { path: 'updatedBy', select: USER_FIELDS },
    ]);
    res.json({ item });
  }),

  remove: asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  }),

  uploadAttachment: asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
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
  }),

  deleteAttachment: asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const attachment = item.attachments.find(
      (a) => a._id?.toString() === req.params.attachmentId
    );
    item.attachments = item.attachments.filter(
      (a) => a._id?.toString() !== req.params.attachmentId
    );
    await item.save();

    if (attachment) {
      const filePath = path.join(UPLOAD_DIR, path.basename(attachment.filePath));
      fs.unlink(filePath, () => {});
    }

    res.json({ item });
  }),
});
