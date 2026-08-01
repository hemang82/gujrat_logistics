import connectToDatabase from './src/lib/db';
import mongoose from 'mongoose';

async function migrate() {
  await connectToDatabase();
  const originalLogisticId = new mongoose.Types.ObjectId('6a6b0ae052ade456c4ffa218');
  
  const pkgRes = await mongoose.connection.collection('packagingmasters').updateMany(
    { logisticId: { $exists: false } },
    { $set: { logisticId: originalLogisticId } }
  );
  console.log('Packaging updated:', pkgRes.modifiedCount);

  const pkgResNull = await mongoose.connection.collection('packagingmasters').updateMany(
    { logisticId: null },
    { $set: { logisticId: originalLogisticId } }
  );
  console.log('Packaging updated (null):', pkgResNull.modifiedCount);

  const itemRes = await mongoose.connection.collection('itemdescriptionmasters').updateMany(
    { logisticId: { $exists: false } },
    { $set: { logisticId: originalLogisticId } }
  );
  console.log('Items updated:', itemRes.modifiedCount);

  const itemResNull = await mongoose.connection.collection('itemdescriptionmasters').updateMany(
    { logisticId: null },
    { $set: { logisticId: originalLogisticId } }
  );
  console.log('Items updated (null):', itemResNull.modifiedCount);

  process.exit(0);
}

migrate();
