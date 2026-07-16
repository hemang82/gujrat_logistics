import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  code: string;
  state: string;
  pincode?: string;
  distance?: number;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  agent?: mongoose.Types.ObjectId | any;
  bookingInward?: 'B' | 'I' | 'B/I';
  commiBasis?: string;
  commiAmount?: number;
  dcBasis?: string;
  dcAmount?: number;
  lcBasis?: string;
  lcAmount?: number;
  brnRateBasis?: string;
  brnAmount?: number;
  directData?: string;
  isDeleted?: boolean;
}

const BranchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    state: { type: String, required: true },
    pincode: { type: String },
    distance: { type: Number, default: 0 },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    gstNumber: { type: String },
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    bookingInward: { type: String, enum: ['B', 'I', 'B/I'], default: 'B/I' },
    commiBasis: { type: String },
    commiAmount: { type: Number, default: 0 },
    dcBasis: { type: String },
    dcAmount: { type: Number, default: 0 },
    lcBasis: { type: String },
    lcAmount: { type: Number, default: 0 },
    brnRateBasis: { type: String },
    brnAmount: { type: Number, default: 0 },
    directData: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Branch: Model<IBranch> = mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);
export default Branch;
