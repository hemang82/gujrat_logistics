const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/traking_website_db').then(async () => {
  const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
  const b = await Booking.find({}).sort({ updatedAt: -1 }).limit(1).lean();
  console.log(JSON.stringify(b, null, 2));
  process.exit(0);
});
