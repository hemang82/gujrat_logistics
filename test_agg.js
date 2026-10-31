const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: '.env.local' });
const { format } = require('date-fns');

async function testAgg() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  // User branch is RAMBAUG KALYAN: 6ae43c5cff9a1d72945d051e
  const branchId = new mongoose.Types.ObjectId('6ae43c5cff9a1d72945d051e');
  const now = new Date('2026-10-31T17:05:16+05:30');
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);

  const bookingScope = {
    $or: [{ branch: branchId }, { bookingBranch: branchId }]
  };

  const agg = await db.collection('bookings').aggregate([
    { $match: { ...bookingScope, isDeleted: { $ne: true }, bookingDate: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
        count: { $sum: 1 },
        revenue: { $sum: '$charges.totalAmount' }
      }
    }
  ]).toArray();

  console.log('sevenDaysAgo:', sevenDaysAgo);
  console.log('Agg result:', agg);

  const bookingDayMap = new Map((agg || []).map((b) => [b._id, b]));
  for (let i = 6; i >= 0; i--) {
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = format(target, 'yyyy-MM-dd');
    const match = bookingDayMap.get(key);
    console.log('Day index:', i, 'target:', target, 'key:', key, 'match:', match);
  }

  await mongoose.disconnect();
}
testAgg();
