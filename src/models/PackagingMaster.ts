import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPackagingMaster extends Document {
  logisticId?: mongoose.Types.ObjectId;
  name: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PackagingMasterSchema = new Schema<IPackagingMaster>(
  {
    logisticId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

PackagingMasterSchema.index({ name: 'text' });
PackagingMasterSchema.index({ name: 1, logisticId: 1 }, { unique: true });

const PackagingMaster: Model<IPackagingMaster> =
  mongoose.models.PackagingMaster ||
  mongoose.model<IPackagingMaster>('PackagingMaster', PackagingMasterSchema);

export default PackagingMaster;
