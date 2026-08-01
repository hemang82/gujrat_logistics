import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriver extends Document {
  logisticId?: mongoose.Types.ObjectId;
  branch?: mongoose.Types.ObjectId | any;
  name: string;
  phone: string;
  alternatePhone?: string;
  licenseNumber: string;
  licenseExpiry?: Date;
  aadharNumber?: string;
  address?: string;
  bloodGroup?: string;
  assignedVehicle?: mongoose.Types.ObjectId;
  status: 'available' | 'on-trip' | 'on-leave' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}

const DriverSchema = new Schema<IDriver>(
  {
    logisticId: { type: Schema.Types.ObjectId, ref: 'User' },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: { type: Date },
    aadharNumber: { type: String },
    address: { type: String },
    bloodGroup: { type: String },
    assignedVehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    status: {
      type: String,
      enum: ['available', 'on-trip', 'on-leave', 'inactive'],
      default: 'available',
    },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Driver: Model<IDriver> = mongoose.models.Driver || mongoose.model<IDriver>('Driver', DriverSchema);
export default Driver;
