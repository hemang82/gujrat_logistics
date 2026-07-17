import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILorryHire extends Document {
  voucherNo: string;
  date: Date;
  fromBranch: mongoose.Types.ObjectId | any;
  toBranch: mongoose.Types.ObjectId | any;
  truckNo: mongoose.Types.ObjectId | any;
  challans: mongoose.Types.ObjectId[] | any[];
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  balancePaidBy: mongoose.Types.ObjectId | any;
  status: 'pending' | 'completed';
  createdBy?: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const LorryHireSchema = new Schema<ILorryHire>(
  {
    voucherNo: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    fromBranch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    toBranch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    truckNo: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    challans: [{ type: Schema.Types.ObjectId, ref: 'Challan' }],
    totalAmount: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    balancePaidBy: { type: Schema.Types.ObjectId, ref: 'Branch' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const LorryHire: Model<ILorryHire> = mongoose.models.LorryHire || mongoose.model<ILorryHire>('LorryHire', LorryHireSchema);
export default LorryHire;
