
/**
 * Module dependencies.
 */

var Conversation = require('./../models/conversation'),
    User = require('./../models/user'),
    Message = require('./../models/message'),
    _ = require('lodash'),
    ObjectId = require('mongoose').Types.ObjectId;

/**
 * Resource methods.
 */

/**
 * Retrieves a list of all a user's conversations.
 */

function list(req, res) {
  var id = ObjectId(req.params.id);
  var conversationsLastViewed = {};

  Conversation.find({users: id}, {'_id': 0, 'users': 1, 'lastViewed': 1, 'created': 1},
    function(err, conversations) {
      // output an error message if an error occurs
      if(err) {
        res.send({error: 'Unable to list conversations.'});
      }

      // array to hold users in the conversation
      var userIds = [];

      // retrieve all the users from the conversations
      conversations.forEach(function(conversation) {
        conversation.users.forEach(function(userId) {
          
          // we do not include the source user
          if(!ObjectId(userId).equals(id)) {
            userIds.push(userId);
            conversationsLastViewed[userId] = {
              lastViewed: conversation.lastViewed[id],
              created: conversation.created
            };
          }
        });
      });

      // if userIds is empty return empty array
      if(userIds.length == 0){
        return res.send({data: []});
      }

      // find users with the ids
      User.find(
        {_id: {$in: userIds}},
        { '_id': 1,
          'email': 1,
          'firstName': 1,
          'lastName': 1,
          'picture': 1,
          'headline': 1,
          'title': 1,
          'picture': 1
        },
        function(userErr, users) {
          // output an error message if an error occurs or
          // the users could not be found
          if(err || !users) {
            res.send({error: 'Unable to list conversations.'});
          }

          var resultUsers = [];
          var totalUsers = 0;

          users.forEach(function(user) {
            // find messages with either the sender as the source
            // and the recipient as the target or vice versa
            Message.findOne({
              $or: [
                {
                  $and: [
                    {sender: id},
                    {recipient: user._id}
                  ]
                },
                {
                  $and: [
                    {sender: user._id},
                    {recipient: id}
                  ]
                }
              ]
            },
            {'_id': 0, 'sender': 1, 'recipient': 1, 'text': 1, 'created': 1},
            {sort: {created: -1}},
            function(messageErr, message) {
              // output an error message if an error occurs
              if(messageErr) {
                return res.send({error: 'Unable to list messages.'});
              }

              user = user.toObject();

              if(message) {
                if(conversationsLastViewed[user._id].lastViewed === undefined) {
                  user.showNewMessageIndicator = true;
                } else {
                  var viewedBeforeLastMessage = conversationsLastViewed[user._id].lastViewed < message.created;
                  var didNotSendMessage = !ObjectId(id).equals(message.sender);

                  user.showNewMessageIndicator = viewedBeforeLastMessage && didNotSendMessage;
                }
              } else {
                console.log(conversationsLastViewed[user._id].lastViewed === undefined);
                message = {text: 'Start a conversation!', created: conversationsLastViewed[user._id].created};
                user.showNewMessageIndicator = conversationsLastViewed[user._id].lastViewed === undefined;
              }

              user.latestMessage = message;

              resultUsers.push(user);

              totalUsers++;

              if(totalUsers === users.length) {
                function sortByLatestMessageDate(a, b) {
                  return a.latestMessage.created - b.latestMessage.created;
                }

                resultUsers = resultUsers.sort(sortByLatestMessageDate).reverse();

                // sends a success message if successfully created
                res.send({data: resultUsers});
              }
            });
          });
        }
      );
  });
}

/**
 * Deletes a conversation.
 */

function del(req, res) {
  Conversation.findOneAndRemove(
    {users: {$all: [req.params.id, req.params.target]}}, function(err) {
     // return the error if one occurred
    if(err) {
      res.send({error: 'Unable to remove conversations.'});
    }
    
    // sends a success message if successfully removed
    res.send({success: 'Successfully removed conversation!'});
  });
}

/**
 * Module exports.
 */

exports.list = list;
exports.del = del;
