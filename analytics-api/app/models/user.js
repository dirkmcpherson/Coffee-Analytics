
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   ObjectId = Schema.ObjectId;
 
/**
 * Schema.
 */
var userSchema = new Schema({
  /**
   * Meta.
   */
  created: {type: Date, default: Date.now},

  /**
   * Identifiers.
   */
  firstName: String,
  lastName: String,
  email: String,
  deviceToken: String,

  /**
   * Content.
   */
  picture: String,
  headline: String,
  location: String,
  tags: {type: [String], default: []},
  organization: String,
  industry: String,
  about: String,

  /**
   * Interactions.
   */
  nearbyUsers: [ObjectId],
  viewedUsers: [ObjectId],
  unreadNotificationsCount: {type: Number, default: 0},

  /**
   * OAuth.
   */
  facebook: String,
  linkedin: String,

  /**
   * ExtendedInfo.
   */
  extendedInfo: {
    experience: [Experience],
    education: [Education]
  }
  
});

/**
 * User Subschemas.
 */
var Experience = new Schema({
  position : String,
  organization : String,
  timeSpan : String
});

var Education = new Schema({
  school : String,
  degree : String,
  timeSpan : String
});

/**
 * Module exports.
 */
module.exports = mongoose.model('User', userSchema);
