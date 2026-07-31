import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStockItem extends Document {
  logisticId?: mongoose.Types.ObjectId;
  itemName: string;
  type: 'in' | 'out';
  quantity: number;
  unit: string;
  sourceDestination: string;
  handledBy?: mongoose.Types.ObjectId;
  photoUrl?: string;
  date: Date;
}

const StockItemSchema = new Schema<IStockItem>(
  {
    logisticId: { type: Schema.Types.ObjectId, ref: 'User' },
    itemName: { type: String, required: true },
    type: { type: String, enum: ['in', 'out'], required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    sourceDestination: { type: String, required: true },
    handledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    photoUrl: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const StockItem: Model<IStockItem> = mongoose.models.StockItem || mongoose.model<IStockItem>('StockItem', StockItemSchema);
export default StockItem;
