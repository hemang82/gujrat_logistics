import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
  name: string;
  address?: string;
  phone?: string;
  gstin?: string;
  contactPerson?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true, unique: true },
    address: { type: String },
    phone: { type: String },
    gstin: { type: String },
    contactPerson: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
export default Client;
