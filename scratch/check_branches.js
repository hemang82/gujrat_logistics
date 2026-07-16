const mongoose = require('mongoose');
const { Schema } = mongoose;

const branchSchema = new Schema({}, { strict: false });
const Branch = mongoose.models.Branch || mongoose.model('Branch', branchSchema);

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/gujrat_logistics');
  const branches = await Branch.find({});
  console.log("Branches:", branches.map(b => ({ _id: b._id, name: b.name, code: b.code })));
  process.exit();
}
run();
