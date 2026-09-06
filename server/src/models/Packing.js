import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export const PACKING_PAYMENT_METHODS = ['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'other'];

// Packing & fulfillment items -- packaging materials, printing, and the
// packing process itself. Bespoke shape (not the shared checklist factory
// used by Planning/Marketing/Features/Delivery/App Progress) since these
// track a brand/vendor + payment/quantity detail per item, and don't need
// the checklist's "who completed this and when" tracking.
const packingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    brandName: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    date: { type: Date, default: null },
    // Free-text name of whoever handled this item -- same pattern as
    // Purchase's "purchasedBy": anyone's name, not a registered-user ref.
    who: { type: String, default: '', trim: true },
    paymentMethod: { type: String, enum: PACKING_PAYMENT_METHODS, default: 'cash' },
    itemQty: { type: Number, default: 1, min: 0 },
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

export default mongoose.model('Packing', packingSchema);
