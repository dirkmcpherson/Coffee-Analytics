
/**
 * Module dependencies.
 */

var SocketIO = require('socket.io'),
    Message = require('./../controllers/message'),
    Notification = require('./notifications'),
    User = require('./../controllers/user')
    Conversation = require('./../models/conversation'),
    ObjectId = require('mongoose').Types.ObjectId;

// array to hold current connected users
var users = {};

/**
 * Returns the object of connected users.
 *
 * @return {Object}
 * @api public
 */

function getConnectedUsers() {
  return users;
}

/**
 * Adds event listeners to the socket server.
 *
 * @param {Object} io
 * @api public
 */

function addEventListeners(server) {
  SocketIO.listen(server).sockets.on('connection',
    function(socket) {
      /**
       * Event handlers.
       */

      /**
       * Assign a socket to a user id.
       *
       * @param {Object} data
       * @api private
       */

      function join(data) {
        users[data.userId] = socket;
        User.clearUnreadNotificationsCount(data.userId);
      }

      /**
       * Remove a socket assigned to a user id when they disconnect.
       *
       * @param {Object} data
       * @api private
       */

      function dc(data) {
        delete users[data.userId];
      }

      /**
       * Send a message to the user and save it to the database.
       *
       * @param {Object} data
       * @api private
       */

      function send(data) {
        // retrieve the socket of the specified recipient
        var recipient = users[data.recipient];

        // if the socket exists, relay them the data
        if(recipient) {
          recipient.emit('receive', data);
        } else {
          // if the socket does not exist, send the specified user a push notification
          var senderName = data.firstName + ' ' + data.lastName;
          var notificationText = senderName + ': ' + data.text;
          Notification.send(data.recipient, notificationText);
        }

        // save the message to the database
        Message(data);
      }

      /**
       * Marks the latest message as read because the user was present
       * in the chat window.
       *
       * @param {Object} data
       * @api private
       */

      function didReceiveMessage(data) {
        data = data.args[0];

        Conversation.findOne(
          {users: {$all: [data.sender, data.recipient]}},
          function(convoErr, convo) {

            if(convoErr) {
              console.error(convoErr); 
            }

            if(!convoErr && convo) {
              convo.lastViewed[data.recipient] = new Date();
              convo.markModified('lastViewed');
              convo.save(function(errSave) {
                if(errSave) {
                  console.log(errSave);
                }

                console.log('saved!');
              });
            }
          }
        );
      }

      // add event listeners
      socket.on('join', join);
      socket.on('dc', dc);
      socket.on('send', send);
      socket.on('didReceiveMessage', didReceiveMessage);
    }
  );
}

/**
 * Module exports.
 */

exports.initialize = addEventListeners;
exports.getConnectedUsers = getConnectedUsers;
