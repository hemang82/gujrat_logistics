const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.connection.collection('users');
  const user = await User.findOne({ email: 'admin@gujaratlogistic.com' });
  console.log(user);
  mongoose.disconnect();
}
checkUser();
