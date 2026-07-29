import mongoose from 'mongoose';

const consolidatedEwayBillSchema = new mongoose.Schema({
  cEwbNo: {
    type: String,
    required: true,
    unique: true
  },
  vehicleNo: {
    type: String,
    required: true
  },
  fromPlace: {
    type: String
  },
  fromState: {
    type: String
  },
  transMode: {
    type: String,
    default: '1'
  },
  transDocNo: {
    type: String
  },
  transDocDate: {
    type: String
  },
  ewbNoDetails: [{
    ewbNo: { type: Number, required: true }
  }],
  status: {
    type: String,
    enum: ['Active', 'Cancelled'],
    default: 'Active'
  },
  cEwbDate: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export default mongoose.models.ConsolidatedEwayBill || mongoose.model('ConsolidatedEwayBill', consolidatedEwayBillSchema);
