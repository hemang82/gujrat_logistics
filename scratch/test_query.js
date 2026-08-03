const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const db = mongoose.connection.db;
    
    // Simulate what page.tsx is doing
    const query = {
      isDeleted: false,
      logisticId: new mongoose.Types.ObjectId("6a6c45518e23efe4910d09d3"),
      $or: [
        { bookingBranch: new mongoose.Types.ObjectId("6a6d7c9756f4e710e690b24e") },
        { branch: new mongoose.Types.ObjectId("6a6d7c9756f4e710e690b24e") },
        { destinationBranch: new mongoose.Types.ObjectId("6a6d7c9756f4e710e690b24e") }
      ]
    };
    
    const count = await db.collection('bookings').countDocuments(query);
    console.log("Count with ObjectId:", count);

    const queryStr = {
      isDeleted: false,
      logisticId: new mongoose.Types.ObjectId("6a6c45518e23efe4910d09d3"),
      $or: [
        { bookingBranch: "6a6d7c9756f4e710e690b24e" },
        { branch: "6a6d7c9756f4e710e690b24e" },
        { destinationBranch: "6a6d7c9756f4e710e690b24e" }
      ]
    };
    const countStr = await db.collection('bookings').countDocuments(queryStr);
    console.log("Count with string IDs:", countStr);

    // Using Mongoose Model directly
    const Booking = require('./src/models/Booking').default;
    const mongooseCountStr = await Booking.countDocuments({
      isDeleted: false,
      logisticId: "6a6c45518e23efe4910d09d3",
      $or: [
        { bookingBranch: "6a6d7c9756f4e710e690b24e" },
        { branch: "6a6d7c9756f4e710e690b24e" },
        { destinationBranch: "6a6d7c9756f4e710e690b24e" }
      ]
    });
    console.log("Mongoose Model count with strings:", mongooseCountStr);

    process.exit();
}).catch(console.error);
