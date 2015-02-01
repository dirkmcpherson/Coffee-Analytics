
/**
 * Module dependencies.
 */

// var Model = require('./../models')('Like')
var Like = require('./../models/like'),
    User = require('./../models/user'),
    Conversation = require('./../models/conversation'),
    ObjectId = require('mongoose').Types.ObjectId,
    Util = require('./../../util/util'),
    Notification = require('./../services/notifications'),
    Sockets = require('./../services/sockets');
    ObjectId = require('mongoose').Types.ObjectId;

/**
 * Resource methods.
 */

//like usage by date
function usageDate(req,res){
  var dateFormat = 'M.DD';// 'M.dd'
  var usage = {}; 

  Like.find({},
    {},
    {sort: {created: 1}},
    function(err, likes){
      if(err){
        res.send( {error:'unable to retrieve likes'})
      }
      else{
        likes.forEach( function(like){
          var created = moment.utc(like.created).format(dateFormat);
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


//binned like usage
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
          Like.count({source:user._id}, function(err,count){
            if( err ){
              res.send({error:'could not get likes'})
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

 /*
  Check if a like exists between two users
 */
 function exists( req , res ){

    Like.find( {source : req.params.source, target : req.params.target },
      {},
      {},
     function(err,data){
      if( err ){
        res.send({error : 'unable to determine whether like exists'})
      }
      else{
       res.send(data);
      }
    })
    return;
 }

 function getAll(req, res){

  console.log('Likes-getAll')

  Like.find( {source: req.params.source},{},{},
   function(err,data){
    if(err){
      res.send({error:'unable to get all likes for user'})
    }
    else{
      res.send(data);
    }
  })
  return;
 }

/**
 * Creates a like.
 */

function create(req, res) {
  new Like({source: req.params.source, target: req.params.target})
    .save(function(errSave) {
      // returns an error if it could not be created
      if(errSave) {
        return res.send({error: 'Unable to create like.'});
      }

      Like.findOne(
        {source: req.params.target, target: req.params.source},
        function(findErr, like) {
          if(findErr) {
            return res.send({error: 'Unable to create like.'});
          }

          if(like) {
            Conversation.create(
              {
                users: [ObjectId(req.params.source),
                ObjectId(req.params.target)]
              },
              function(createErr, convo) {
                if(createErr) {
                  return res.send({error: 'Unable to create like.'});
                }

                convo = convo.toObject();

                delete convo.__v;
                delete convo.created;

                User.find({_id: {$in: convo.users}},
                  {_id: 1, firstName: 1, lastName: 1, headline: 1, location: 1,
                    picture: 1, tags: 1, organization: 1, industry: 1, about: 1,
                    extendedInfo: 1},
                  function(userErr, users) {
                    if(userErr) {
                      return res.send({error: 'Unable to create like.'});
                    }

                    convo.users = users;

                    var targetSocket = Sockets.getConnectedUsers()[req.params.target];

                    if(targetSocket) {
                      targetSocket.emit('match');
                      console.log('Emitted a match.');
                    } else {
                      Notification.send(req.params.target, 'You received a match!'); 
                    }

                    // sends a success message if it was successfully created
                    return res.send({data: convo});
                  }
                );
              }
            );
          } else {
            // sends a success message if it was successfully created
            return res.send({success: 'Like successfully created!'});
          }
        }
      )
    }
  );
}

/**
 * Module exports.
 */
exports.usage = usage; 
exports.usageDate = usageDate; 
exports.getAll = getAll;
exports.exists = exists;
exports.create = create;
