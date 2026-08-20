const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://hemangchandekar82_db_user:Xn0FbGKc8w6h1wDF@ac-ob92omv-shard-00-00.053glqp.mongodb.net:27017,ac-ob92omv-shard-00-01.053glqp.mongodb.net:27017,ac-ob92omv-shard-00-02.053glqp.mongodb.net:27017/trust_logistic_db?ssl=true&replicaSet=atlas-v6a09d-shard-0&authSource=admin&retryWrites=true&w=majority';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'logistic', 'branch', 'admin', 'manager', 'accountant', 'driver'], default: 'branch' },
});

// Avoid re-compiling schema if already compiled
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedSuperAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const email = 'superadmin@trustlogistic.in';
    const password = 'TrustAdmin@123';
    
    // Check if exists
    let existingAdmin = await User.findOne({ email });
    
    if (existingAdmin) {
      console.log('Superadmin already exists. Updating password and role just in case...');
      existingAdmin.password = await bcrypt.hash(password, 10);
      existingAdmin.role = 'superadmin';
      await existingAdmin.save();
      console.log('Superadmin updated successfully!');
    } else {
      console.log('Creating new superadmin...');
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new User({
        name: 'Trust Super Admin',
        email,
        password: hashedPassword,
        role: 'superadmin'
      });
      await newAdmin.save();
      console.log('Superadmin created successfully!');
    }
    
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('Error seeding superadmin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedSuperAdmin();
