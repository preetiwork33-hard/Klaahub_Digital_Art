const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  console.log('Connecting to database...');

  // Find all artists
  const artists = await db.collection('users').find({ role: 'artist' }).toArray();
  console.log(`Found ${artists.length} artists to migrate.`);

  for (const artist of artists) {
    const artworkCount = await db.collection('artworks').countDocuments({ 
      artist: artist._id 
    });

    await db.collection('users').updateOne(
      { _id: artist._id },
      { $set: { artworkCount: artworkCount } }
    );

    console.log(`Updated artist "${artist.name}" (${artist._id}) with artworkCount: ${artworkCount}`);
  }

  console.log('Migration complete!');
  process.exit(0);
}).catch(e => {
  console.error('Error running migration:', e.message);
  process.exit(1);
});
