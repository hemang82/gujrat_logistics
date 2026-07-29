import mongoose from 'mongoose';

const consolidatedEwayBillSchema = new mongoose.Schema({
  cEwbNo: {
    type: String,
    required: true,
    unique: true
  },
  challanNo: {
    type: String
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
  validUpto: {
    type: Date
  },
  extensionHistory: [{
    extendedAt: { type: Date, default: Date.now },
    oldValidUpto: { type: Date },
    newValidUpto: { type: Date },
    reason: { type: String }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export default mongoose.models.ConsolidatedEwayBill || mongoose.model('ConsolidatedEwayBill', consolidatedEwayBillSchema);
