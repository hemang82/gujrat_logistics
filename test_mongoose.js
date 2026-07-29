const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const ConsolidatedEwayBill = require('./src/models/ConsolidatedEwayBill').default || require('./src/models/ConsolidatedEwayBill');

async function testInsert() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Create using the model itself to test mongoose schema
    const newBill = await ConsolidatedEwayBill.create({
      cEwbNo: 'TEST_CEWB_999',
      challanNo: 'CH-TEST',
      vehicleNo: 'GJTEST',
      fromPlace: 'TEST',
      fromState: 'TEST',
      transMode: 'Road',
      ewbNoDetails: [],
      cEwbDate: new Date().toISOString(),
      status: 'Active',
      createdBy: new mongoose.Types.ObjectId()
    });
    
    console.log('Created document:', newBill);
    
    // Clean up
    await ConsolidatedEwayBill.deleteOne({ _id: newBill._id });
    console.log('Cleaned up test document');
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

testInsert();
