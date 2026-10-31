const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: '.env.local' });

async function checkBooking() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const branchId = new mongoose.Types.ObjectId('6ae43c5cff9a1d72945d051e');
  const logisticId = new mongoose.Types.ObjectId('6ae439ca91b0b1a2f22e0d61');

  // Exact query from dashboard/page.tsx:
  const baseQuery = { logisticId };
  const bookingScope = { ...baseQuery, bookingBranch: branchId };

  console.log('bookingScope:', bookingScope);
  const count = await db.collection('bookings').countDocuments(bookingScope);
  console.log('Bookings matching bookingScope:', count);

  const bookings = await db.collection('bookings').find(bookingScope).toArray();
  console.log('Bookings:', bookings.map(b => ({ lr: b.lrNumber, bookingDate: b.bookingDate, createdAt: b.createdAt })));

  await mongoose.disconnect();
}
checkBooking();
