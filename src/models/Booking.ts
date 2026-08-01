import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  logisticId?: mongoose.Types.ObjectId;
  lrNumber: string;
  branch?: mongoose.Types.ObjectId | any;
  bookingBranch?: mongoose.Types.ObjectId | any;
  destinationBranch?: mongoose.Types.ObjectId | any;
  rateType?: string;
  deliveryType?: string;
  pvtMarka?: string;
  invoiceNo?: string;
  ewayBillNo?: string;
  consignor: { name: string; phone: string; address?: string; gstNumber?: string };
  consignee: { name: string; phone: string; address?: string; gstNumber?: string };
  material: { itemName: string; weight: number; chargedWeight: number; quantity: number; packagingType: string };
  items?: {
    packages: number;
    packaging: string;
    description: string;
    weight: number;
    nw: string;
    rate: number;
    amount: number;
  }[];
  pickupLocation?: string;
  deliveryLocation?: string;
  vehicle?: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  trackingHistory: { status: string; timestamp: Date; location?: string; remarks?: string }[];
  charges: {
    freightAmount: number;
    hamali: number;
    surCharge: number;
    pf?: number;
    ddCharge?: number;
    biltyCharge?: number;
    gstRate: number;
    gstAmount: number;
    totalAmount: number;
  };
  bookingType?: 'auto' | 'manual';
  paymentCondition: 'to_pay' | 'paid' | 'tbb';
  isPaid?: boolean;
  bookingDate: Date;
  deliveryDate?: Date;
  createdBy?: mongoose.Types.ObjectId;
  isDeleted?: boolean;
}

const BookingSchema = new Schema<IBooking>(
  {
    logisticId: { type: Schema.Types.ObjectId, ref: 'User' },
    bookingType: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
    lrNumber: { type: String, required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    bookingBranch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    destinationBranch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    rateType: { type: String },
    deliveryType: { type: String },
    pvtMarka: { type: String },
    invoiceNo: { type: String },
    ewayBillNo: { type: String },
    consignor: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String },
      gstNumber: { type: String },
    },
    consignee: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String },
      gstNumber: { type: String },
    },
    material: {
      itemName: { type: String },
      weight: { type: Number },
      chargedWeight: { type: Number },
      quantity: { type: Number },
      packagingType: { type: String },
    },
    items: [
      {
        packages: { type: Number, default: 0 },
        packaging: { type: String, default: '' },
        description: { type: String, default: '' },
        weight: { type: Number, default: 0 },
        nw: { type: String, default: 'N' },
        rate: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
      }
    ],
    pickupLocation: { type: String },
    deliveryLocation: { type: String },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver' },
    status: {
      type: String,
      enum: ['pending', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingHistory: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        location: { type: String },
        remarks: { type: String },
      }
    ],
    charges: {
      freightAmount: { type: Number, default: 0 },
      hamali: { type: Number, default: 0 },
      surCharge: { type: Number, default: 0 },
      pf: { type: Number, default: 0 },
      ddCharge: { type: Number, default: 0 },
      biltyCharge: { type: Number, default: 10 },
      gstRate: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
    },
    paymentCondition: {
      type: String,
      enum: ['to_pay', 'paid', 'tbb'],
      default: 'to_pay',
    },
    isPaid: { type: Boolean, default: false },
    bookingDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;

