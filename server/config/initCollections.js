const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Report = require('../models/Report');

/**
 * Ensures all collections exist in MongoDB Atlas by creating
 * each collection explicitly BEFORE any data is inserted.
 * This guarantees all tables are created in the database.
 */
const initCollections = async () => {
  try {
    const db = mongoose.connection.db;
    const existing = await db.listCollections().toArray();
    const existingNames = existing.map((c) => c.name);

    const required = [
      { name: 'users', model: User },
      { name: 'posts', model: Post },
      { name: 'comments', model: Comment },
      { name: 'conversations', model: Conversation },
      { name: 'messages', model: Message },
      { name: 'notifications', model: Notification },
      { name: 'reports', model: Report },
    ];

    for (const col of required) {
      if (!existingNames.includes(col.name)) {
        await db.createCollection(col.name);
        console.log(`✅ Collection created: ${col.name}`);
      }
    }

    // Build indexes for all models (idempotent / creates even if collections exist)
    await Promise.all(
      required.map(async (col) => {
        await col.model.init();
      })
    );
    console.log('✅ All collections initialized & indexes ensured.');
  } catch (error) {
    console.error('❌ Error initializing collections:', error.message);
  }
};

module.exports = initCollections;

