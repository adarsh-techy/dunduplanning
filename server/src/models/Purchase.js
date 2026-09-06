import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  }
);

const purchaseSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    category: { type: String, default: '', trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    unitCost: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 },
    vendor: { type: String, default: '', trim: true },
    purchaseDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['planned', 'ordered', 'received'],
      default: 'planned',
    },
    notes: { type: String, default: '' },
    linkedStep: { type: mongoose.Schema.Types.ObjectId, ref: 'Step', default: null },
    attachments: { type: [attachmentSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

purchaseSchema.pre('save', function computeTotal(next) {
  this.totalCost = Math.round((this.quantity || 0) * (this.unitCost || 0) * 100) / 100;
  next();
});

export default mongoose.model('Purchase', purchaseSchema);
