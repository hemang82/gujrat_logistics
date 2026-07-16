import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'accountant' | 'driver';
  phone?: string;
  branch?: mongoose.Types.ObjectId | any;
  bookingBranch?: mongoose.Types.ObjectId | any;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Hashed password
    role: {
      type: String,
      enum: ['admin', 'manager', 'accountant', 'driver'],
      default: 'manager',
    },
    phone: { type: String },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    bookingBranch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
