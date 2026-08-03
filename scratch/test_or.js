const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Booking = require('./src/models/Booking').default;
    const userBranchStr = '6a6d7c9756f4e710e690b24e'; // Surat branch
    
    // Test 1: $or with string
    const query1 = { $or: [{ bookingBranch: userBranchStr }, { branch: userBranchStr }, { destinationBranch: userBranchStr }] };
    const count1 = await Booking.countDocuments(query1);
    
    // Test 2: direct assignment
    const query2 = { bookingBranch: userBranchStr };
    const count2 = await Booking.countDocuments(query2);
    
    console.log('Count1 ($or string):', count1);
    console.log('Count2 (direct string):', count2);
    process.exit();
}).catch(console.error);
