const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  // Find Preeti Kumari's account to keep it
  const keepUser = await db.collection('users').findOne({ 
    role: 'artist', 
    name: { $regex: /preeti/i } 
  });

  if (!keepUser) {
    console.log('Preeti Kumari not found in DB. Listing all artists:');
    const all = await db.collection('users').find({ role: 'artist' }).toArray();
    all.forEach(u => console.log(u._id, u.name, u.email));
    process.exit(0);
  }

  console.log('Keeping artist:', keepUser.name, keepUser._id);

  // Delete all other artist accounts (not admin, not buyer — only extra artists)
  const result = await db.collection('users').deleteMany({ 
    role: 'artist', 
    _id: { $ne: keepUser._id } 
  });

  console.log(`Deleted ${result.deletedCount} test/demo artist accounts.`);
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
