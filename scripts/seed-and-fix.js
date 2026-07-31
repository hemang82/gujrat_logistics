const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function fixFiles() {
  const filesToFix = [
    'src/app/admin/(dashboard)/bookings/page.tsx',
    'src/app/admin/(dashboard)/challans/page.tsx',
    'src/components/admin/AdminSidebar.tsx',
    'src/components/admin/AdminTopbar.tsx'
  ];

  for (const file of filesToFix) {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/logistic_admin/g, 'logistic');
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed logistic_admin -> logistic in ${file}`);
    } else {
      console.log(`File not found: ${file}`);
    }
  }
}

async function seedDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing in .env.local');
    return;
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Load models
  const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    companyLogo: String,
    gstNumber: String,
    transporterId: String,
    panNumber: String,
  }, { strict: false });
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  // 1. Super Admin
  const superAdminEmail = 'admin@gujaratlogistic.com';
  let superAdmin = await User.findOne({ email: superAdminEmail });
  if (!superAdmin) {
    superAdmin = new User({
      name: 'Super Admin',
      email: superAdminEmail,
      password: password,
      role: 'superadmin'
    });
    await superAdmin.save();
    console.log(`Created Super Admin: ${superAdminEmail}`);
  } else {
    console.log(`Super Admin already exists: ${superAdminEmail}`);
  }

  // 2. Logistic Admin
  const logisticEmail = 'owner@demologistic.com';
  let logistic = await User.findOne({ email: logisticEmail });
  if (!logistic) {
    logistic = new User({
      name: 'Demo Logistic Owner',
      email: logisticEmail,
      password: password,
      role: 'logistic',
      gstNumber: '24AAACC4175D1Z4',
      transporterId: '24AAACC4175D1Z4',
      panNumber: 'AAACC4175D'
    });
    await logistic.save();
    console.log(`Created Logistic Admin: ${logisticEmail}`);
  } else {
    console.log(`Logistic Admin already exists: ${logisticEmail}`);
  }

  mongoose.disconnect();
}

async function run() {
  await fixFiles();
  await seedDatabase();
}

run();
