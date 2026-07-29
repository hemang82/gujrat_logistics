const mongoose = require('mongoose');
const MONGODB_URI = "mongodb://localhost:27017/traking_website";

require('dotenv').config({ path: '.env.local' });

async function fixDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collection = db.collection('consolidatedewaybills');
    
    // Update the most recent CEWBs to have a Challan No
    await collection.updateOne(
      { cEwbNo: "123293418224" },
      { $set: { challanNo: "CH-1002" } }
    );
    
    console.log('Fixed DB entries');
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

fixDB();
