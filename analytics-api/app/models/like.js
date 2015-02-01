
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;

/**
 * Schema.
 */

var likeSchema = new Schema({
  created: {type: Date, default: Date.now},
  source: ObjectId,
  target: ObjectId
});

/**
 * Module exports.
 */

module.exports = mongoose.model('Like', likeSchema);
