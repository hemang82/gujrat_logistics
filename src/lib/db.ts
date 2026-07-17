import mongoose from 'mongoose';
import dns from 'dns';

// Import all models so they are registered globally
import '@/models/User';
import '@/models/Branch';
import '@/models/Client';
import '@/models/Agent';
import '@/models/Vehicle';
import '@/models/Driver';
import '@/models/Booking';
import '@/models/Challan';
import '@/models/LorryHire';

// Force Node's DNS resolver to use Google DNS so that MongoDB Atlas SRV lookups resolve successfully
// even if the user's local network/ISP DNS is blocking or failing SRV records.
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('Failed to set Google DNS, falling back to system DNS', e);
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
