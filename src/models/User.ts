import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'superadmin' | 'logistic' | 'branch' | 'admin' | 'manager' | 'accountant' | 'driver';
  phone?: string;
  logisticId?: mongoose.Types.ObjectId | any;
  branch?: mongoose.Types.ObjectId | any;
  bookingBranch?: mongoose.Types.ObjectId | any;
  ewbApiAccess?: boolean;
  ewbApiQuota?: number;
  
  // Logistic Profile Fields
  companyLogo?: string;
  gstNumber?: string;
  transporterId?: string;
  panNumber?: string;
  
  isDeleted?: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Hashed password
    role: {
      type: String,
      enum: ['superadmin', 'logistic', 'branch', 'admin', 'manager', 'accountant', 'driver'],
      default: 'branch',
    },
    phone: { type: String },
    logisticId: { type: Schema.Types.ObjectId, ref: 'User' },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    bookingBranch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    ewbApiAccess: { type: Boolean, default: false },
    ewbApiQuota: { type: Number, default: 0 },
    
    // Logistic Profile Fields
    companyLogo: { type: String },
    gstNumber: { type: String },
    transporterId: { type: String },
    panNumber: { type: String },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
