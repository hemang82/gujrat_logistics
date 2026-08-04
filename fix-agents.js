require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function fixAgents() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const agentsWithoutLogisticId = await db.collection('agents').find({ logisticId: { $exists: false } }).toArray();
  
  for (const agent of agentsWithoutLogisticId) {
    if (agent.createdBy) {
      const user = await db.collection('users').findOne({ _id: agent.createdBy });
      if (user && user.logisticId) {
        await db.collection('agents').updateOne({ _id: agent._id }, { $set: { logisticId: user.logisticId } });
        console.log('Fixed agent', agent.name);
      } else if (user && user.role === 'logistic') {
        await db.collection('agents').updateOne({ _id: agent._id }, { $set: { logisticId: user._id } });
        console.log('Fixed agent with logistic creator', agent.name);
      }
    }
  }
  console.log('Done fixing agents. Total fixed:', agentsWithoutLogisticId.length);
  process.exit(0);
}

fixAgents();
