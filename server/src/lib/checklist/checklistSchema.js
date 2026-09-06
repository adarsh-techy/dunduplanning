import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// Every "checklist-style" module (Planning, Marketing, Features, Delivery)
// shares this exact shape: a titled item with a status, a cost, a due date,
// notes and attachments. Building each module's Mongoose model from this one
// factory keeps them consistent and avoids re-typing the same schema four times.
export const buildChecklistSchema = () =>
  new mongoose.Schema(
    {
      title: { type: String, required: true, trim: true },
      // Optional grouping label (e.g. "Dashboard & Analytics", "Deployment")
      // -- used by modules with enough items to need sections, like App Progress.
      category: { type: String, default: '', trim: true },
      description: { type: String, default: '' },
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'complete'],
        default: 'pending',
      },
      estimatedCost: { type: Number, default: 0, min: 0 },
      actualCost: { type: Number, default: 0, min: 0 },
      dueDate: { type: Date, default: null },
      // Who marked this complete, and when -- both are freely editable.
      // completedBy is a plain name (not a User reference) so it can credit
      // anyone, including people who aren't registered system users.
      completedDate: { type: Date, default: null },
      completedBy: { type: String, default: '', trim: true },
      order: { type: Number, default: 0 },
      notes: { type: String, default: '' },
      attachments: { type: [attachmentSchema], default: [] },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
  );

export const createChecklistModel = (modelName) => mongoose.model(modelName, buildChecklistSchema());
