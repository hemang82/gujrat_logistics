import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicketReply {
  message: string;
  sender: 'logistic' | 'superadmin' | 'branch';
  createdAt: Date;
}

export interface ITicket extends Document {
  ticketId: string;
  logisticId: mongoose.Types.ObjectId | any;
  branchId?: mongoose.Types.ObjectId | any; // optional if branch raised it
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  replies: ITicketReply[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketId: { type: String, required: true, unique: true },
    logisticId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
    replies: [
      {
        message: { type: String, required: true },
        sender: { type: String, enum: ['logistic', 'superadmin', 'branch'], required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// Pre-save hook to generate ticketId
TicketSchema.pre('validate', async function () {
  if (this.isNew && !this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TKT-${1000 + count + 1}`;
  }
});

if (mongoose.models.Ticket) {
  delete mongoose.models.Ticket;
}
const Ticket: Model<ITicket> = mongoose.model<ITicket>('Ticket', TicketSchema);
export default Ticket;
