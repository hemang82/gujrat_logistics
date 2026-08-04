const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function fixUser() {

  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.connection.collection('users');

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  await User.updateOne(
    { email: 'admin@gujaratlogistic.com' },
    { $set: { role: 'superadmin', password: password } }
  );

  console.log('Fixed admin user to be superadmin and reset password to password123');

  mongoose.disconnect();

}
fixUser();
