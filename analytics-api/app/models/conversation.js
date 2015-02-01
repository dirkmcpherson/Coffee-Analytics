
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;
 
/**
 * Schema.
 */
var conversationSchema = new Schema({
  created: {type: Date, default: Date.now},
  users: [ObjectId],
  lastViewed: {type: Schema.Types.Mixed, default: {}}
});

/**
 * Module exports.
 */
module.exports = mongoose.model('Conversation', conversationSchema);
