const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Booking = require('./src/models/Booking').default;
    
    const q1 = {
      isDeleted: { $ne: true },
      logisticId: '6a6c45518e23efe4910d09d3',
      $or: [
        { bookingBranch: '6a6d7c9756f4e710e690b24e' },
        { branch: '6a6d7c9756f4e710e690b24e' },
        { destinationBranch: '6a6d7c9756f4e710e690b24e' }
      ]
    };
    const c1 = await Booking.countDocuments(q1);
    
    console.log('Count:', c1);
    
    // Also let's print ALL booking branch IDs for this logistic:
    const all = await Booking.find({ logisticId: '6a6c45518e23efe4910d09d3' }).lean();
    console.log('All LRs:');
    all.forEach(a => {
        console.log(`LR ${a.lrNumber}: branch=${a.branch}, dest=${a.destinationBranch}`);
    });
    
    process.exit();
}).catch(console.error);
