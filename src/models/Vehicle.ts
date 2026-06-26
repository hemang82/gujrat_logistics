import mongoose, { Schema, Model } from 'mongoose';

export interface IVehicle {
  _id?: any;
  vehicleNumber: string;
  type: string; // e.g., 'Open', 'Container', 'Trailer', 'LCV'
  capacity: string; // e.g., '10 Ton'
  make?: string; // e.g., 'Tata', 'Ashok Leyland'
  model?: string; // e.g., 'Signa 5530'
  rcNumber?: string;
  rcExpiry?: Date;
  insuranceExpiry?: Date;
  fitnessExpiry?: Date;
  nationalPermitExpiry?: Date;
  ownerName?: string;
  ownerPhone?: string;
  currentLocation?: string;
  status: 'available' | 'on-trip' | 'maintenance';
  assignedDriver?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    vehicleNumber: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    capacity: { type: String, required: true },
    make: { type: String },
    model: { type: String },
    rcNumber: { type: String },
    rcExpiry: { type: Date },
    insuranceExpiry: { type: Date },
    fitnessExpiry: { type: Date },
    nationalPermitExpiry: { type: Date },
    ownerName: { type: String },
    ownerPhone: { type: String },
    currentLocation: { type: String },
    status: {
      type: String,
      enum: ['available', 'on-trip', 'maintenance'],
      default: 'available',
    },
    assignedDriver: { type: Schema.Types.ObjectId, ref: 'Driver' },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Vehicle: Model<IVehicle> = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
export default Vehicle;
