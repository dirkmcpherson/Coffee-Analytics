
/**
 * Module dependencies.
 */

var apn = require('apn'),
    User = require('./../../models')('User'),
    NotificationEvents = require('./events');

/**
 * Options for APNS.
 */

// set default environment to development
var environment = 'development';

// set environment to production if it is set as an environment variable
if(process.env.NODE_ENV === 'production') {
  environment = 'production';
}

// create the options object that will be passed into the connection
var options = {
  passphrase: '12345',
  cert: 'config/' + environment + '/cert.pem',
  key:'config/' + environment + '/key.pem'
};

/**
 * Initialize APNS service with options.
 */

var service = new apn.connection(options);

/**
 * Add notification event listeners.
 */

NotificationEvents(service);

/**
 * Sends a push notification to the specified user.
 *
 * @param {ObjectId} userId
 * @param {String} text
 * @api public
 */

function sendPushNotification(userId, text) {
  // find a user with the specified user id
  User('findOne', {_id: userId}, function(user) {

    // retrieve the device token of the user
    var token = user.deviceToken;

    // output an error if a user's device token does not exist
    if(!token || token === 'noToken') {
      console.error('Error: Token does not exist.');
    } else {
      // increment the user's unread messages
      if(!user.unreadNotificationsCount) {
        user.unreadNotificationsCount = 1;
      } else {
        user.unreadNotificationsCount += 1;
      }

      // create a new notification with the specified text as payload
      var notification = new apn.notification();
      notification.setAlertText(text);
      notification.badge = user.unreadNotificationsCount;
      notification.sound = 'default';

      // push the notification to the found device token
      service.pushNotification(notification, token);

      // save the user's unread message count
      user.save(function(errSave) {
        if(errSave) {
          console.error('Could not save unread notifications count.');
        }
      });
    }
  }, function(err) {
    // output an error if one with the specified user id could not be found
    console.error('Error: Could not retrieve user.');
  });
}

/**
 * Module exports.
 */

exports.send = sendPushNotification;
