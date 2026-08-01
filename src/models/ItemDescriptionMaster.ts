import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItemDescriptionMaster extends Document {
  logisticId?: mongoose.Types.ObjectId;
  name: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ItemDescriptionMasterSchema = new Schema<IItemDescriptionMaster>(
  {
    logisticId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

ItemDescriptionMasterSchema.index({ name: 'text' });
ItemDescriptionMasterSchema.index({ name: 1, logisticId: 1 }, { unique: true });

const ItemDescriptionMaster: Model<IItemDescriptionMaster> =
  mongoose.models.ItemDescriptionMaster ||
  mongoose.model<IItemDescriptionMaster>('ItemDescriptionMaster', ItemDescriptionMasterSchema);

export default ItemDescriptionMaster;
