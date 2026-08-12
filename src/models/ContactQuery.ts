import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactQuery extends Document {
  firstName: string;
  lastName: string;
  workEmail: string;
  companyName: string;
  message: string;
  status: 'pending' | 'resolved';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactQuerySchema = new Schema<IContactQuery>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    workEmail: { type: String, required: true },
    companyName: { type: String, required: false },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const ContactQuery: Model<IContactQuery> = mongoose.models.ContactQuery || mongoose.model<IContactQuery>('ContactQuery', ContactQuerySchema);
export default ContactQuery;
