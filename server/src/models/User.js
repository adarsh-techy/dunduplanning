import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MODULE_KEYS } from '../config/modules.js';

const permissionsSchema = {};
MODULE_KEYS.forEach((key) => {
  permissionsSchema[key] = { type: Boolean, default: false };
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
    permissions: permissionsSchema,
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

userSchema.index({ isActive: 1, role: 1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    permissions: this.permissions,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
