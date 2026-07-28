const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function grantAccess() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all admins to have API access
    const result = await mongoose.connection.collection('users').updateMany(
      { role: 'admin' },
      { $set: { ewbApiAccess: true, ewbApiQuota: 1000 } }
    );

    console.log(`Updated ${result.modifiedCount} admin users with E-Way Bill API Access.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

grantAccess();
