import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// Hosting & deployment cost tracking -- backend hosting, frontend hosting,
// database, domain/SSL, and any other recurring service the live app
// depends on. Bespoke shape (not the shared checklist factory) since this
// needs a standalone "who manages it" field plus two distinct dates (when
// it was set up vs. when it next renews), which the generic checklist
// shape's single completion-linked date/name pair doesn't cover.
const deploymentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    // Free-text name of whoever set up/manages this service -- same
    // pattern as Purchase's "purchasedBy" and Packing's "who": anyone's
    // name, not restricted to registered system users.
    who: { type: String, default: '', trim: true },
    date: { type: Date, default: null },
    renewalDate: { type: Date, default: null },
    cost: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'complete'],
      default: 'pending',
    },
    order: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    attachments: { type: [attachmentSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Deployment', deploymentSchema);
