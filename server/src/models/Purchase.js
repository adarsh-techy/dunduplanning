import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// One product bought as part of this purchase. `totalAmount` is entered
// directly (not derived from a unit price × qty) since that's how the
// business actually records what it paid for each product.
const purchaseItemSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  quantity: { type: Number, default: 1, min: 0 },
  totalAmount: { type: Number, default: 0, min: 0 },
});

export const PURCHASE_PAYMENT_METHODS = ['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'other'];

// A purchase is one trip/order to a vendor -- who went, where, when, how it
// was paid -- covering one or more products (`items`), each its own line.
const purchaseSchema = new mongoose.Schema(
  {
    vendorName: { type: String, required: true, trim: true },
    location: { type: String, default: '', trim: true },
    purchaseDate: { type: Date, default: null },
    // Free-text name of whoever made this purchase -- the same pattern as
    // "completedBy" on checklist items: anyone's name, not restricted to
    // registered system users.
    purchasedBy: { type: String, default: '', trim: true },
    paymentMethod: { type: String, enum: PURCHASE_PAYMENT_METHODS, default: 'cash' },
    items: { type: [purchaseItemSchema], default: [] },
    // Sum of every item's totalAmount -- stored (not computed on read) so
    // it can be sorted/aggregated on directly, e.g. for dashboard totals.
    totalCost: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '' },
    // Bills/receipts/photos for this purchase -- the same attachment shape
    // used everywhere else in the app.
    attachments: { type: [attachmentSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

purchaseSchema.index({ createdAt: -1 });
purchaseSchema.index({ purchaseDate: -1 });
purchaseSchema.index({ vendorName: 1 });

purchaseSchema.pre('save', function computeTotal(next) {
  this.totalCost =
    Math.round((this.items || []).reduce((sum, item) => sum + (item.totalAmount || 0), 0) * 100) / 100;
  next();
});

export default mongoose.model('Purchase', purchaseSchema);
