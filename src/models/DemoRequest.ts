import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDemoRequest extends Document {
  name: string;
  email: string;
  companyName: string;
  phone: string;
  city: string;
  fleetSize: string;
  painPoint: string;
  status: 'pending' | 'contacted' | 'closed';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DemoRequestSchema = new Schema<IDemoRequest>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    companyName: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    fleetSize: { type: String, default: '1-10' },
    painPoint: { type: String, required: true },
    status: { type: String, enum: ['pending', 'contacted', 'closed'], default: 'pending' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const DemoRequest: Model<IDemoRequest> = mongoose.models.DemoRequest || mongoose.model<IDemoRequest>('DemoRequest', DemoRequestSchema);
export default DemoRequest;
