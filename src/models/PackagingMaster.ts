import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPackagingMaster extends Document {
  name: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PackagingMasterSchema = new Schema<IPackagingMaster>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

PackagingMasterSchema.index({ name: 'text' });

const PackagingMaster: Model<IPackagingMaster> =
  mongoose.models.PackagingMaster ||
  mongoose.model<IPackagingMaster>('PackagingMaster', PackagingMasterSchema);

export default PackagingMaster;
