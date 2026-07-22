const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/gujrat_logistics').then(async () => {
  const b = await mongoose.connection.collection('bookings').findOne({ status: 'pending' });
  console.log(JSON.stringify(b, null, 2));
  process.exit();
});
