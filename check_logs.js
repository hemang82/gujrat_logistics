const mongoose = require('mongoose');
const MONGODB_URI = "mongodb://localhost:27017/traking_website";

require('dotenv').config({ path: '.env.local' });

async function checkApiLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collection = db.collection('apilogs');
    
    const logs = await collection.find({ apiType: 'CEWB_GENERATE' }).sort({ createdAt: -1 }).limit(3).toArray();
    
    console.log('\n--- LATEST 3 API LOGS ---');
    logs.forEach((log, idx) => {
      console.log(`\n#${idx + 1} Status: ${log.responseStatus}`);
      console.log(`  Request Data: ${log.requestData}`);
      console.log(`  Created At: ${log.createdAt}`);
    });
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkApiLogs();
