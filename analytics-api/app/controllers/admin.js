
/**
 * Module dependencies.
 */

var express = require('express'),
    Like = require('./../models/like'),
    User = require('./../models/user'),
    Conversation = require('./../models/conversation'),
    Message = require('./../models/message');
    moment = require('./../../node_modules/moment')

/**
 * Hardcore Reset.
 */

var auth = express.basicAuth(function(user, pass) {     
  return (user == "super" && pass == "secret");
});

function reset(req, res) {
  Like.remove({}, function(err) { console.log('Like collection removed') });
  User.remove({}, function(err) { console.log('Users collection removed') });
  Conversation.remove({}, function(err) { console.log('Conversations collection removed') });
  Message.remove({}, function(err) { console.log('Message collection removed') });

  res.send("Database Hard Reset!");
}

//get matches by day (conversations)
function matches(req, res){
  var dateFormat = 'M.DD'
  var usage = {};
  var created = ''; 

  Conversation.find({},
    {'created':1},
    {},
    function( err, conversations){
      if( err ){
        res.send({error:'Could not get conversations'});
      }
      else{
        conversations.forEach( function( conversation ){
          created = moment.utc(conversation.created).format(dateFormat);
          if( usage.hasOwnProperty(created) ){
            usage[created]++; 
          }
          else{
            usage[created] = 1; 
          }
        })

        res.send({data:usage})
      }
    })
}

//get matches by day
// function matches( req, res){
//   var datFormat = 'M.DD'
//   var usage = {};
//   var srcDate, trgDate, matchDate;

//   User.find({about:{$exists:true}},
//     {'viewedUsers':1},
//     {},
//     function(err, users){
//       if(err){
//         res.send({error:'couldnt get users'})
//       }
//       else{
//         users.forEach( function(user){
//           //for every target this user liked, did the target like them back? 
//           Like.find( {source:user._id},
//           {},
//           {},
//           function( err, likes){
//             if(err){
//              res.send({error:'couldnt get users'})
//             }
//             else{
//               likes.forEach( function( like ){
//                 //a match occurred on the later like
//                 srcDate = like.created;
//                 trgDate = isMatch(like.target,user._id);
//                 if( trgDate ){ //theres a match, record it on the later date
//                   matchDate = srcDate > trgDate ? srcDate : trgDate 
//                   matchDate = moment.utc(matchDate).format(dateFormat)

//                   if( usage.hasOwnProperty(matchDate) ){
//                     usage[matchDate]++;
//                   }
//                   else{
//                     usage[matchDate] = 1; 
//                   }

//                   if( user === users[users.length - 1] && like === likes[likes.length - 1]){ //hack to send after last user
//                      console.log(usage)
//                      res.send(usage)
//                    }

//                 }
//               })
//             }
//           })
//         })
//       }
//     })
// }

//does the src like the target? returns the date of the like if there is one, -1 if not
function isMatch( src, trg) {
  Like.findOne( {source:src, target:trg},
  {'created':1},
  {},
  function( err , like ){
    if( err ){
      console.log('couldnt get like')
    }
    else{
      if( like ){
        return like.created
      }
      else return -1;
    }
  })
}

//on-off important factors 
function macroData( req, res){
  var macroData = {'swipes':0,'likes':0,'matches':0}

  //total number of swipes is how many users have been viewed
  User.find({about:{$exists:true}},
    {'viewedUsers':1},
    {},
    function(err,users){
      if( err ){
        res.send({error:'couldnt get users'})
      }
      else{
        users.forEach( function( user ){
          macroData['swipes'] += user.viewedUsers.length

          if( user === users[users.length - 1]){
            res.send( macroData )
          }
        })
      }
    })

  //total number of likes
  Like.count({}, function( err, count){
    if( err ){
      res.send({error: 'couldnt get likes'})
    }
    else{
      macroData['likes'] = count; 
    }
  })

  //total number of matches (this one is a bitch and takes a very long time to do properly)
  Conversation.count({}, function( err, count){
    if( err ){
      res.send({error: 'couldnt get conversations'})
    }
    else{
      macroData['matches'] = count; 
    }
  })
}

/*
Find and bin useage by month,day (if possible). Simple measure of use, # of users to perform any action on a day. 
*/
function usageDate( req, res){
  var dateFormat = 'M.DD';// 'M.dd'
  var usage = {}; 

  ////haaaaack, flags to only send once both calls are complete
  var mFlag = false;
  var lFlag = false; 

  Message.find({},
    {},
    {sort: {created: 1}},
    function(err,messages){
      if( err ){
        res.send( {error: 'Unable to get messages'} ) 
        return;
      }
      else{
        messages.forEach( function(message){
          var created = moment.utc(message.created).format(dateFormat)
          var user = message.sender; 
          if( usage.hasOwnProperty( created )){ //Do we have a record of this day? 
            if( usage[created].hasOwnProperty(user) ){
              //do nothing, this user has already been logged for today
            }
            else{ //otherise add the user
              usage[created][user] = '';
              usage[created].count++; //increment count for the day
            } 
          }
          else{ //otherwise create create a field with the day
            usage[created] = {count:1}; //initiate count 
            usage[created][user] = ''; 
          }
        })

        //hacks to make sure bother calls complete before the usage data is tallied and sent
        mFlag = true; 
        if( lFlag === true){
          res.send( binCollectionByDate(usage) );
          return; 
        }
      }
    })


  //same thing but for likes
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
          var user = like.source;
          if( usage.hasOwnProperty( created )){
            if( usage[created].hasOwnProperty(user)){
                //do nothing, we've already logged this user on this day
            }
            else{
              usage[created][user] = ''; //empty string
              usage[created].count++; 
            }
          }
          else{ //haven't logged this day
            usage[created] = {count:1}; 
            usage[created][user] = ''; 
         }
        })

        //hacks to make sure bother calls complete before the usage data is tallied and sent
        lFlag = true;
        if( mFlag === true ){
          res.send( {data:binCollectionByDate( usage )} )
        return;
        }
      }
    })

}

function binCollectionByDate( collection ){
  binnedUsage = {}; 
  for( var date in collection){
    binnedUsage[date] = collection[date].count; 
  }
  return binnedUsage; 
}


/**
 * Module exports.
 */


exports.matches = matches;
exports.usageDate = usageDate; 
exports.macroData = macroData;

exports.auth = auth;
exports.reset = reset;
