import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriverTransaction extends Document {
  driver: mongoose.Types.ObjectId;
  date: Date;
  type: 'advance_given' | 'expense_reported' | 'salary_paid' | 'settled';
  amount: number;
  description: string;
  relatedExpense?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
}

const DriverTransactionSchema = new Schema<IDriverTransaction>(
  {
    driver: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    date: { type: Date, required: true, default: Date.now },
    type: { 
      type: String, 
      enum: ['advance_given', 'expense_reported', 'salary_paid', 'settled'], 
      required: true 
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    relatedExpense: { type: Schema.Types.ObjectId, ref: 'Expense' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const DriverTransaction: Model<IDriverTransaction> = mongoose.models.DriverTransaction || mongoose.model<IDriverTransaction>('DriverTransaction', DriverTransactionSchema);
export default DriverTransaction;
