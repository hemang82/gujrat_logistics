import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  client?: mongoose.Types.ObjectId;
  clientName: string;
  clientAddress?: string;
  clientPhone?: string;
  clientGst?: string;
  bookings: mongoose.Types.ObjectId[];
  totalFreight: number;
  totalHamali: number;
  totalSurcharge: number;
  totalGst: number;
  grandTotal: number;
  amountPaid: number;
  status: 'unpaid' | 'partial' | 'paid';
  invoiceDate: Date;
  dueDate: Date;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    clientName: { type: String, required: true },
    clientAddress: { type: String },
    clientPhone: { type: String },
    clientGst: { type: String },
    bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
    totalFreight: { type: Number, default: 0 },
    totalHamali: { type: Number, default: 0 },
    totalSurcharge: { type: Number, default: 0 },
    totalGst: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export default Invoice;
