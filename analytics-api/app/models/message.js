
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;
 
/**
 * Schema.
 */
var messageSchema = new Schema({
  created: {type: Date, default: Date.now},
  sender: ObjectId,
  recipient: ObjectId,
  text: String
});

/**
 * Module exports.
 */
module.exports = mongoose.model('Message', messageSchema);
