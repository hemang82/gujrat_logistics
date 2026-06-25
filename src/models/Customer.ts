import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email?: string;
  address: string;
  gstNumber?: string;
  totalBookings: number;
  outstandingAmount: number;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    gstNumber: { type: String },
    totalBookings: { type: Number, default: 0 },
    outstandingAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
export default Customer;
