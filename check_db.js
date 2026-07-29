const mongoose = require('mongoose');
const MONGODB_URI = "mongodb://localhost:27017/traking_website"; // Assuming local standard mongo, I'll fetch from .env instead

require('dotenv').config({ path: '.env.local' });

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // We only need the raw collection to see the document structure
    const db = mongoose.connection.db;
    const collection = db.collection('consolidatedewaybills');
    
    const bills = await collection.find({}).sort({ createdAt: -1 }).limit(3).toArray();
    
    console.log('\n--- LATEST 3 CEWBs ---');
    bills.forEach((bill, idx) => {
      console.log(`\n#${idx + 1} CEWB No: ${bill.cEwbNo}`);
      console.log(`  Challan No: ${bill.challanNo === undefined ? 'UNDEFINED' : `"${bill.challanNo}"`}`);
      console.log(`  Vehicle No: ${bill.vehicleNo}`);
      console.log(`  Created At: ${bill.createdAt}`);
    });
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkDB();
