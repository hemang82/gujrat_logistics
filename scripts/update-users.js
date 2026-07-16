const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in environment');
  process.exit(1);
}

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Get the users collection
    const UserCollection = mongoose.connection.collection('users');

    // Update all users who do not have a branch or bookingBranch
    console.log('Updating user records in database...');
    const result = await UserCollection.updateMany(
      { 
        $or: [
          { branch: { $exists: false } },
          { bookingBranch: { $exists: false } }
        ]
      },
      {
        $set: {
          branch: 'ASL',
          bookingBranch: 'ASLALI'
        }
      }
    );

    console.log(`Success! Updated ${result.modifiedCount} user records.`);
  } catch (error) {
    console.error('Error during update:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

run();
