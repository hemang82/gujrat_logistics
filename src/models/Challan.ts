import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChallan extends Document {
  logisticId?: mongoose.Types.ObjectId;
  challanNumber: string;
  branch: mongoose.Types.ObjectId | any;
  challanDate: Date;
  allBranchwise: 'All' | 'Branchwise';
  bookingCrossing: 'Booking' | 'Crossing';
  selectiveDefault: 'Selective' | 'Default';
  lrToBranch?: mongoose.Types.ObjectId | any;
  bookings: mongoose.Types.ObjectId[];
  truckNo?: mongoose.Types.ObjectId | any;
  agent?: string;
  memoDestinationBranch?: mongoose.Types.ObjectId | any;
  driverName?: mongoose.Types.ObjectId | any;
  truckFreight: number;
  advanceAmount: number;
  commission: number;
  remark?: string;
  isDeleted: boolean;
  status: 'pending' | 'in_transit' | 'delivered';
  createdBy?: mongoose.Types.ObjectId;
  cewbNo?: string;
  cewbUrl?: string;
}

const ChallanSchema = new Schema<IChallan>(
  {
    logisticId: { type: Schema.Types.ObjectId, ref: 'User' },
    challanNumber: { type: String, required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    challanDate: { type: Date, default: Date.now },
    allBranchwise: { type: String, enum: ['All', 'Branchwise'], default: 'All' },
    bookingCrossing: { type: String, enum: ['Booking', 'Crossing'], default: 'Booking' },
    selectiveDefault: { type: String, enum: ['Selective', 'Default'], default: 'Selective' },
    lrToBranch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
    truckNo: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    agent: { type: String },
    memoDestinationBranch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    driverName: { type: Schema.Types.ObjectId, ref: 'Driver' },
    truckFreight: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    remark: { type: String },
    isDeleted: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'in_transit', 'delivered'], default: 'pending' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cewbNo: { type: String },
    cewbUrl: { type: String },
  },
  { timestamps: true }
);

if (mongoose.models.Challan) {
  delete mongoose.models.Challan;
}
const Challan: Model<IChallan> = mongoose.model<IChallan>('Challan', ChallanSchema);
export default Challan;
