const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: '.env.local' });
const { format } = require('date-fns');

async function debugDashboard() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const user = await db.collection('users').findOne({ email: 'shipindiaship@gmail.com' });
  console.log('User found:', {
    role: user.role,
    branch: user.branch,
    logisticId: user.logisticId
  });

  const baseQuery = {};
  if (user.role === 'logistic') {
    baseQuery.logisticId = user._id;
  } else if (user.logisticId) {
    baseQuery.logisticId = user.logisticId;
  }

  const isBranchUser = user.role === 'branch';
  let activeBranchDoc = null;
  if (isBranchUser) {
    activeBranchDoc = await db.collection('branches').findOne({
      $or: [
        { _id: user.branch },
        { code: user.branch }
      ]
    });
  }

  console.log('activeBranchDoc:', activeBranchDoc ? { name: activeBranchDoc.name, _id: activeBranchDoc._id } : null);

  const bookingScope = { ...baseQuery };
  if (activeBranchDoc) {
    bookingScope.bookingBranch = activeBranchDoc._id;
  }

  console.log('bookingScope:', bookingScope);

  const now = new Date();
  console.log('now:', now.toISOString(), 'local string:', now.toString());

  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
  console.log('sevenDaysAgo:', sevenDaysAgo.toISOString());

  const last7DaysBookingsAgg = await db.collection('bookings').aggregate([
    { $match: { ...bookingScope, isDeleted: { $ne: true }, bookingDate: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" } },
        count: { $sum: 1 },
        revenue: { $sum: "$charges.totalAmount" }
      }
    }
  ]).toArray();

  console.log('last7DaysBookingsAgg:', last7DaysBookingsAgg);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const bookingDayMap = new Map((last7DaysBookingsAgg || []).map((b) => [b._id, b]));
  const last7DaysData = [];

  for (let i = 6; i >= 0; i--) {
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = format(target, 'yyyy-MM-dd');
    const match = bookingDayMap.get(key);
    last7DaysData.push({
      day: i === 0 ? 'Today' : dayNames[target.getDay()],
      dateStr: format(target, 'dd MMM'),
      bookings: match?.count || 0,
      revenue: match?.revenue || 0,
      key
    });
  }

  console.log('last7DaysData:', JSON.stringify(last7DaysData, null, 2));

  await mongoose.disconnect();
}
debugDashboard();
