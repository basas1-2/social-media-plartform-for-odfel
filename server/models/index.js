/**
 * Central model registry.
 *
 * All Mongoose models are defined and loaded here at the very beginning
 * of the application. Because Mongoose compiles each model once and
 * registers it with the connection, MongoDB collections are created
 * automatically as soon as the application starts storing data — no
 * manual table creation is required.
 *
 * Importing this file registers every model on the Mongoose connection.
 */

const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Notification = require('./Notification');
const Report = require('./Report');
const Group = require('./Group');
const Resource = require('./Resource');
const Schedule = require('./Schedule');

module.exports = {
  User,
  Post,
  Comment,
  Conversation,
  Message,
  Notification,
  Report,
  Group,
  Resource,
  Schedule,
};
