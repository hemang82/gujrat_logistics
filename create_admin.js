const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
mongoose.connect(process.env.MONGODB_URI, { family: 4 }).then(async () => {
  const UserSchema = new mongoose.Schema({}, { strict: false });
  // Make sure to delete the model if it exists
  if (mongoose.models.User) delete mongoose.models.User;
  const User = mongoose.model('User', UserSchema);
  const result = await User.findOneAndUpdate(
    { email: 'admin@gujaratlogistic.com' },
    { 
      $set: { 
        name: 'Super Admin', 
        email: 'admin@gujaratlogistic.com', 
        password: '$2b$10$Q8nANKdmyWyU6j2wHY6A2.alZLhdK1WgYNNs2dKjKJnNWve9lSjwq', 
        plainPassword: 'password123', 
        role: 'superadmin', 
        isActive: true, 
        isDeleted: false 
      } 
    }, 
    { upsert: true, new: true }
  );
  console.log('Admin user updated:', result.email);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
