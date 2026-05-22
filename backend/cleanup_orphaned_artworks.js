const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  console.log('Connecting to database...');

  // Find all artworks where the artist ID does not exist in the users collection
  const orphanedArtworks = await db.collection('artworks').aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'artist',
        foreignField: '_id',
        as: 'artistInfo'
      }
    },
    {
      $match: {
        artistInfo: { $size: 0 }
      }
    }
  ]).toArray();

  console.log(`Found ${orphanedArtworks.length} orphaned artworks in the database.`);

  if (orphanedArtworks.length > 0) {
    const idsToDelete = orphanedArtworks.map(art => art._id);
    const result = await db.collection('artworks').deleteMany({
      _id: { $in: idsToDelete }
    });
    console.log(`Successfully deleted ${result.deletedCount} orphaned artworks.`);
  } else {
    console.log('No orphaned artworks to delete.');
  }

  process.exit(0);
}).catch(e => {
  console.error('Error cleaning up orphaned artworks:', e.message);
  process.exit(1);
});
