
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
   Schema = mongoose.Schema;

/**
 * Schema.
 */

var tagSchema = new Schema({
  text: String
});

/**
 * Module exports.
 */

module.exports = mongoose.model('Tag', tagSchema);
