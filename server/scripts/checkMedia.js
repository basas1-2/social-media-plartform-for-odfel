const mongoose = require('mongoose');
require('dotenv').config();

const m = process.env.MONGO_URI;
mongoose
  .connect(m)
  .then(async () => {
    const db = mongoose.connection.db;
    const posts = await db
      .collection('posts')
      .find({}, { projection: { text: 1, images: 1, video: 1 } })
      .sort({ _id: -1 })
      .limit(3)
      .toArray();
    console.log('POSTS:');
    console.log(JSON.stringify(posts, null, 2));

    const users = await db
      .collection('users')
      .find({}, { projection: { username: 1, profilePicture: 1, coverPhoto: 1 } })
      .limit(3)
      .toArray();
    console.log('USERS:');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  })
  .catch((e) => {
    console.error('ERR', e.message);
    process.exit(1);
  });
