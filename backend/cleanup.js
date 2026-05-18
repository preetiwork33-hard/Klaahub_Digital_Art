const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await mongoose.connection.db.collection('artworks').deleteMany({
    $or: [
      { imageUrl: { $regex: 'unsplash.com' } },
      { imageUrl: { $regex: '^blob:' } }
    ]
  });
  console.log('Cleaned up demo and broken artworks');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
