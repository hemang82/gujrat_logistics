import mongoose, { Schema, Document, Model } from 'mongoose';
import { AGENT_TYPES } from '@/config/constants';

export interface IAgent extends Document {
  logisticId?: mongoose.Types.ObjectId;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  openingBalance: number;
  gstNumber?: string;
  agentType: string;
  isActive: boolean;
  isDeleted: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

const AgentSchema = new Schema<IAgent>(
  {
    logisticId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, unique: true },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    openingBalance: { type: Number, default: 0 },
    gstNumber: { type: String },
    agentType: { type: String, enum: AGENT_TYPES, default: 'Transporter' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Agent: Model<IAgent> = mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);
export default Agent;
