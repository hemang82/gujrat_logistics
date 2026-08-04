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
  
  permissions?: {
    bookings?: {
      canView?: boolean;
      canAdd?: boolean;
      canEdit?: boolean;
      canDelete?: boolean;
    };
    challans?: {
      canView?: boolean;
      canAdd?: boolean;
      canEdit?: boolean;
      canDelete?: boolean;
    };
  };

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
    permissions: {
      type: Schema.Types.Mixed,
      default: {
        bookings: {
          canView: true,
          canAdd: true,
          canEdit: true,
          canDelete: false
        },
        challans: {
          canView: true,
          canAdd: true,
          canEdit: true,
          canDelete: false
        }
      }
    },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

if (mongoose.models.User) {
  delete mongoose.models.User;
}
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;
