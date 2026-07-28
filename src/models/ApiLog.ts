import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApiLog extends Document {
  userId: mongoose.Types.ObjectId | any;
  apiType: string;
  requestData: string;
  responseStatus: 'success' | 'failed' | 'cached';
  errorMessage?: string;
  createdAt: Date;
}

const ApiLogSchema = new Schema<IApiLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    apiType: { type: String, required: true }, // e.g., 'EWAY_BILL_FETCH'
    requestData: { type: String, required: true }, // e.g., EWB Number
    responseStatus: { type: String, enum: ['success', 'failed', 'cached'], required: true },
    errorMessage: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ApiLog: Model<IApiLog> = mongoose.models.ApiLog || mongoose.model<IApiLog>('ApiLog', ApiLogSchema);
export default ApiLog;
