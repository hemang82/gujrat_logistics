import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItemDescriptionMaster extends Document {
  name: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ItemDescriptionMasterSchema = new Schema<IItemDescriptionMaster>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

ItemDescriptionMasterSchema.index({ name: 'text' });

const ItemDescriptionMaster: Model<IItemDescriptionMaster> =
  mongoose.models.ItemDescriptionMaster ||
  mongoose.model<IItemDescriptionMaster>('ItemDescriptionMaster', ItemDescriptionMasterSchema);

export default ItemDescriptionMaster;
