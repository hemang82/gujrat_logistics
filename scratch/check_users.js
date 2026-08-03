const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    const users = await collection.find({role: { $in: ['branch', 'branch_user'] }}).limit(5).toArray();
    console.log(JSON.stringify(users.map(u => ({ email: u.email, role: u.role, branch: u.branch, bookingBranch: u.bookingBranch })), null, 2));
    process.exit();
}).catch(console.error);
