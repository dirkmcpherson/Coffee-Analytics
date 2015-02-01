
/**
 * Module dependencies.
 */

var Message = require('./../models/message'),
    Conversation = require('./../models/conversation'),
    User = require('./../models/user')
    ObjectId = require('mongoose').Types.ObjectId;


/* 
Internal 
*/

function usageDate( req , res ){
  var dateFormat = 'M.DD';// 'M.dd'
  var usage = {}; 

  Message.find({},
    {},
    {sort: {created: 1}},
    function(err, messages){
      if(err){
        res.send( {error:'unable to retrieve messages'})
      }
      else{
        messages.forEach( function(message){
          var created = moment.utc(message.created).format(dateFormat);
          if( usage.hasOwnProperty( created )){
            usage[created]++; 
          }
          else{ //haven't logged this day
            usage[created] = 1; 
          }
        })

        //hacks to make sure bother calls complete before the usage data is tallied and sent
          res.send( {data:usage} )
        }
    })
}

//binned usage
function usage( req , res){
  var bins = {'0':0,'5':0,'10':0,'25':0,'50':0,'100':0}

  User.find({},
    {'_id':1},
    {},
    function( err, users){
      if( err ){
        res.send({error:'could not get users'})
      }
      else{
        users.forEach( function(user){
          Message.count({sender:user._id},
            function( err, count){
              if( err ){
                res.send({error:'could not get messages'})
              }
              else{
                for( var key in bins){
                  if( count <= key ){
                    bins[key]++; 
                    break;
                  }
                  else if( key === '100' && count >= key){
                    bins[key]++;
                    break; 
                  }
                }

                //hack, dont send the data until the last user has been queried 
               if( user === users[users.length-1]){
                  res.send({data:bins})
               }

              }
            })
          
        })
      }
    })
}

//retrieve all messages to or from a user
function retrieve( req, res ){
  Message.find( 
    {$or: [
      {sender: req.params.id},
      {recipient: req.params.id} 
    ]},
    {},
    {sort: {created:1}},
    function(err, messages){
      if(err){
        res.send({error: 'Unable to list messages.'});
      }
      else{
        res.send({data:messages})
      }
    }
  )
}

//retrieve the number of messages from a user
function retrieveCount( req, res){
  var messageCounts = []; 
  var countDictionary = {}; 
  Message.find(
    {},
    {},
    {},
    function(err, messages){
      if(err){
        res.send({error: 'Unable to get message count'});
      }
      else{ //go through all messages and extract the count by user (how many messages each user has sent)
        var messagingUsers = 0; 

        for( var idx in messages){
          var sender = messages[idx].sender;

          if( countDictionary.hasOwnProperty(sender) ){
            countDictionary[sender]++; 
          }
          else{
            countDictionary[sender] = 1; 
          }
        }

        //then put the counts into an array and send that
        for( var idx in countDictionary){
          messageCounts.push( countDictionary[idx] )
        }

        res.send( messageCounts )

      }
    }
  )
}


/**
 * Resource methods.
 */

/**
 * Constructor.
 */

function constructor(data) {
  new Message({
    sender: data.sender,
    recipient: data.recipient,
    text: data.text,
  }).save(function(err) {
    if(err) {
      return { error: 'Unable to create message.' };
    }

    return { success: 'Message successfully created!'};
  });
}

/**
 * Creates a message.
 */

function create(req, res) {
  return Message(
    req.params.sender,
    req.params.recipient,
    req.params.text
  );
}

/**
 * Retrieves a list of all the messages between two users.
 */

function list(req, res) {
  // find messages with either the sender as the source
  // and the recipient as the target or vice versa
  Message.find({
    $or: [
      {
        $and: [
          {sender: ObjectId(req.params.source)},
          {recipient: ObjectId(req.params.target)}
        ]
      },
      {
        $and: [
          {sender: ObjectId(req.params.target)},
          {recipient: ObjectId(req.params.source)}
        ]
      }
    ]
  },
  {'_id': 0, 'sender': 1, 'recipient': 1, 'text': 1, 'created': 1},
  {sort: {created: 1}},
  function(err, messages) {
    // output an error message if an error occurs
    if(err) {
      res.send({error: 'Unable to list messages.'});
    }

    // sends a success message if successfully created
    res.send({data: messages});

    // finds the conversation between the two users and marks it as read
    Conversation.findOne(
      {users: {$all: [req.params.source, req.params.target]}},
      function(convoErr, convo) {

        if(!convoErr && convo) {
          convo.lastViewed[req.params.source] = new Date();
          convo.markModified('lastViewed');
          convo.save(function(errSave) {
            if(errSave) {
              console.log(errSave);
            }
          });
        }
      }
    );
  });
}

/**
 * Module exports.
 */

module.exports = constructor;
module.exports.create = create;
module.exports.list = list;

module.exports.retrieveCount = retrieveCount; 
module.exports.retrieve = retrieve;
module.exports.usage = usage; 
module.exports.usageDate = usageDate; 
