import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILorryHire extends Document {
  logisticId?: mongoose.Types.ObjectId;
  voucherNo: string;
  date: Date;
  fromBranch: mongoose.Types.ObjectId | any;
  toBranch: mongoose.Types.ObjectId | any;
  truckNo: mongoose.Types.ObjectId | any;
  driver?: mongoose.Types.ObjectId | any;
  modeOfTransport?: string;
  fromCity?: string;
  fromState?: string;
  fromPincode?: string;
  toCity?: string;
  toState?: string;
  toPincode?: string;
  challans: mongoose.Types.ObjectId[] | any[];
  totalAmount: number;
  advanceAmount: number;
  commission: number;
  hamali: number;
  tds: number;
  balanceAmount: number;
  balancePaidBy: mongoose.Types.ObjectId | any;
  status: 'pending' | 'completed';
  remark?: string;
  createdBy?: mongoose.Types.ObjectId;
  hasEwbAccess?: boolean;
  isDeleted: boolean;
}

const LorryHireSchema = new Schema<ILorryHire>(
  {
    logisticId: { type: Schema.Types.ObjectId, ref: 'User' },
    voucherNo: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    fromBranch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    toBranch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    truckNo: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver' },
    modeOfTransport: { type: String, default: '1' },
    fromCity: { type: String },
    fromState: { type: String },
    fromPincode: { type: String },
    toCity: { type: String },
    toState: { type: String },
    toPincode: { type: String },
    challans: [{ type: Schema.Types.ObjectId, ref: 'Challan' }],
    totalAmount: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    hamali: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    balancePaidBy: { type: Schema.Types.ObjectId, ref: 'Branch' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    remark: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    hasEwbAccess: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const LorryHire: Model<ILorryHire> = mongoose.models.LorryHire || mongoose.model<ILorryHire>('LorryHire', LorryHireSchema);
export default LorryHire;
