require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, default: 'branch' },
    permissions: { type: mongoose.Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  try {
    console.log('Connecting to database:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    const email = 'admin@trustlogistic.com';
    const plainPassword = 'Trustlogistic@123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const updateData = {
      name: 'Main Admin',
      password: hashedPassword,
      role: 'superadmin',
      isDeleted: false,
      permissions: {
        bookings: { canView: true, canAdd: true, canEdit: true, canDelete: true },
        challans: { canView: true, canAdd: true, canEdit: true, canDelete: true }
      }
    };

    const res = await User.findOneAndUpdate(
      { email: email },
      { $set: updateData },
      { upsert: true, new: true }
    );

    console.log(`Success! Admin user seeded/updated:`);
    console.log(`Email: ${res.email}`);
    console.log(`Password: ${plainPassword}`);
    console.log(`Role: ${res.role}`);

    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seed();
