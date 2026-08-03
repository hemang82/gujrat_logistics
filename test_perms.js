require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  // Find a user with role branch
  const user = await db.collection('users').findOne({ role: 'branch' });
  if (!user) {
    console.log("No branch user found.");
    process.exit();
  }
  console.log("Before Update:", JSON.stringify(user.permissions));
  
  // Update directly in DB using mongoose
  const User = mongoose.connection.model('User', new mongoose.Schema({}, { strict: false }));
  
  const updated = await User.findByIdAndUpdate(user._id, {
    $set: {
      permissions: {
        bookings: {
          canView: true,
          canAdd: true,
          canEdit: true,
          canDelete: true
        }
      }
    }
  }, { new: true });
  
  console.log("After Mongoose Update:", JSON.stringify(updated.permissions));
  process.exit();
}
test();
