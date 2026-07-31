import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBranchCashTransaction extends Document {
  logisticId?: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId | any;
  date: Date;
  type: 'credit' | 'debit';
  amount: number;
  referenceType: 'Booking' | 'LorryHire' | 'CashCollection' | 'Expense' | 'Manual' | 'OpeningBalance';
  referenceId?: mongoose.Types.ObjectId | any;
  description: string;
  balanceAfter: number;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

const BranchCashTransactionSchema = new Schema<IBranchCashTransaction>(
  {
    logisticId: { type: Schema.Types.ObjectId, ref: 'User' },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    referenceType: { 
      type: String, 
      enum: ['Booking', 'LorryHire', 'CashCollection', 'Expense', 'Manual', 'OpeningBalance'], 
      required: true 
    },
    referenceId: { type: Schema.Types.ObjectId }, // Can point to Booking, LorryHire, etc.
    description: { type: String, required: true },
    balanceAfter: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default (mongoose.models.BranchCashTransaction as Model<IBranchCashTransaction>) || mongoose.model<IBranchCashTransaction>('BranchCashTransaction', BranchCashTransactionSchema);
