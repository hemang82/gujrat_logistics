const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const db = mongoose.connection.db;
    const SuratId = new mongoose.Types.ObjectId('6a6d7c9756f4e710e690b24e');
    const AslaliId = new mongoose.Types.ObjectId('6a57364a03e7902d0b1d9a92');
    
    // Convert ALL string ObjectIds to real ObjectIds in bookings (just in case they were saved as strings accidentally)
    const bookings = await db.collection('bookings').find({}).toArray();
    for (const b of bookings) {
      let changed = false;
      let update = {};
      
      if (typeof b.branch === 'string' && b.branch.length === 24) {
        update.branch = new mongoose.Types.ObjectId(b.branch);
        changed = true;
      }
      if (typeof b.bookingBranch === 'string' && b.bookingBranch.length === 24) {
        update.bookingBranch = new mongoose.Types.ObjectId(b.bookingBranch);
        changed = true;
      }
      if (typeof b.destinationBranch === 'string' && b.destinationBranch.length === 24) {
        update.destinationBranch = new mongoose.Types.ObjectId(b.destinationBranch);
        changed = true;
      }
      
      // Also, let's fix LR 1001 so it definitely belongs to Surat for testing
      if (b.lrNumber === '1001') {
        update.branch = SuratId;
        update.bookingBranch = SuratId;
        changed = true;
      }

      if (changed) {
        await db.collection('bookings').updateOne({ _id: b._id }, { $set: update });
        console.log(`Fixed LR ${b.lrNumber}`);
      }
    }
    
    console.log('Done fixing bookings.');
    process.exit();
}).catch(console.error);
