import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  logisticId?: mongoose.Types.ObjectId;
  branch?: mongoose.Types.ObjectId | any;
  expenseType: 'fuel' | 'toll' | 'maintenance' | 'driver_bhatta' | 'rto_challan' | 'other';
  amount: number;
  date: Date;
  vehicle: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  description?: string;
  paymentMethod: 'cash' | 'fastag' | 'card' | 'upi';
  status: 'paid' | 'pending';
  documentUrl?: string; // Optional for future receipts
  createdBy?: mongoose.Types.ObjectId;
  isDeleted?: boolean;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    logisticId: { type: Schema.Types.ObjectId, ref: 'User' },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    expenseType: {
      type: String,
      enum: ['fuel', 'toll', 'maintenance', 'driver_bhatta', 'rto_challan', 'other'],
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver' },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
    description: { type: String },
    paymentMethod: {
      type: String,
      enum: ['cash', 'fastag', 'card', 'upi'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'paid',
    },
    documentUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
export default Expense;
