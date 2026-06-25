import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  lrNumber: string;
  consignor: { name: string; phone: string; address: string; gstNumber?: string };
  consignee: { name: string; phone: string; address: string; gstNumber?: string };
  material: { itemName: string; weight: number; chargedWeight: number; quantity: number; packagingType: string };
  pickupLocation: string;
  deliveryLocation: string;
  vehicle?: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  trackingHistory: { status: string; timestamp: Date; location?: string; remarks?: string }[];
  charges: {
    freightAmount: number;
    hamali: number;
    surCharge: number;
    gstRate: number; // e.g., 5, 12, or custom
    gstAmount: number;
    totalAmount: number;
  };
  paymentCondition: 'to_pay' | 'paid' | 'tbb';
  bookingDate: Date;
  deliveryDate?: Date;
  createdBy?: mongoose.Types.ObjectId;
  isDeleted?: boolean;
}

const BookingSchema = new Schema<IBooking>(
  {
    lrNumber: { type: String, required: true, unique: true },
    consignor: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      gstNumber: { type: String },
    },
    consignee: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      gstNumber: { type: String },
    },
    material: {
      itemName: { type: String, required: true },
      weight: { type: Number, required: true },
      chargedWeight: { type: Number, required: true },
      quantity: { type: Number, required: true },
      packagingType: { type: String, required: true }, // Box, Bag, Bundle, etc.
    },
    pickupLocation: { type: String, required: true },
    deliveryLocation: { type: String, required: true },
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
      freightAmount: { type: Number, required: true },
      hamali: { type: Number, default: 0 },
      surCharge: { type: Number, default: 0 },
      gstRate: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    paymentCondition: {
      type: String,
      enum: ['to_pay', 'paid', 'tbb'],
      default: 'to_pay',
    },
    bookingDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;
