
/**
 * Module dependencies.
 */

var Model = require('./../models')('User'),
    User = require('./../models/user'),
    Like = require('./like'),
    Message = require('./message')
    ObjectId = require('mongoose').Types.ObjectId
    Util = require('./../../util/util');
    moment = require('./../../node_modules/moment')

/**
 * Resource methods.
 */

/**
 * Clear unread messages.
 */

function clearUnreadNotificationsCount(userId) {
  User.findOne({_id: userId}, function(err, user) {
    if(err || !user) {
      console.error('Could not edit user.');
      return;
    }

    user.unreadNotificationsCount = 0;

    user.save(function(saveErr) {
      if(saveErr) {
        console.error('Could not edit user');
      }
    })
  });
}

/**
 * Increment unread messages count.
 */

function incrementUnreadNotificationsCount(userId) {
  User.findOne({_id: userId}, function(err, user) {
    if(err || !user) {
      console.log('Could not edit user.');
      return;
    }

    if(!user.unreadNotificationsCount) {
      user.unreadNotificationsCount = 1;
    } else {
      user.unreadNotificationsCount += 1;
    }

    user.save(function(saveErr) {
      if(saveErr) {
        console.log('Could not edit user');
      }
    })
  });
}

/**
 * Creates a new user.
 */

function create(req, res) {

  var query = [{ email: req.query.email }];

  var socialNetwork;

  if(req.query.facebook !== undefined) {
    socialNetwork = 'Facebook';
    query.push({facebook: req.query.facebook});
  } else {
    socialNetwork = 'LinkedIn';
    query.push({linkedin: req.query.linkedin});
  }

  User.findOne(
    {
        $or: query
    },
    function(err, user) {
      if(err) {
        //exit if an error occurs
        res.send({ error: 'Could not create user.'});
      } else if(user) {
        user.deviceToken = req.query.deviceToken;

        if(socialNetwork === 'Facebook' && user.facebook === undefined) {
          user.facebook = req.query.facebook;
        } else if(socialNetwork === 'LinkedIn' && user.linkedin === undefined) {
          user.linkedin = req.query.linkedin;

          if(req.query.picture !== undefined) {
            user.picture = req.query.picture;
          }
        }

        user.save(function(errSave) {
          if(errSave) {
            res.send({ error: 'Could not create user.'});
          }
        });

        user = user.toObject();

        delete user['__v'];
        delete user['created'];

        res.send(user);
      } else {
        var newUser = User();

        newUser.deviceToken = req.query.deviceToken;
        newUser.firstName = req.query.firstName;
        newUser.lastName = req.query.lastName;
        newUser.email = req.query.email;
        newUser.industry = req.query.industry;
        newUser.organization = req.query.organization;
        newUser.extendedInfo = req.body;
        console.log(req.body);

        if(socialNetwork === 'Facebook') {
          newUser.facebook = req.query.facebook;
        } else {
          newUser.linkedin = req.query.linkedin;
          newUser.headline = req.query.headline;
          newUser.location = req.query.location;
        }

        if(req.query.picture !== undefined) {
          newUser.picture = req.query.picture;
        }

        newUser.save(function(errNewUser, savedUser) {
          if(errNewUser) {
            res.send({ error: 'Could not create user.'});
          } else {
            savedUser = savedUser.toObject();

            delete savedUser['__v'];
            delete savedUser['created'];

            res.send(savedUser);
          }
        })
      }
    }
  );
}

/**
 * Edit the user.
 */

function edit(req, res) {
  User.findOne({_id: req.params.id}, function(err, user) {
    if(err || !user) {
      return res.send({error: 'Could not edit user.'});
    }

    for(key in req.query) {
      user[key] = req.query[key];
    }

    user.save(function(saveErr) {
      if(saveErr) {
        return res.send({error: 'Could not edit user.'});
      }

      return res.send({success: 'Successfully edited user!'});
    })
  });
}

/**
 * Update the user's extended info.
 */

function updateInfo(req, res) {
  User.findOne({_id: req.params.id}, function(err, user) {
    if (err || !user) {
      return res.send({error: 'Could not update user.'});
    }
    
    user.extendedInfo = req.body;

    user.save(function(saveErr) {
      if (saveErr) {
        return res.send({error: 'Could not update user'});
      }
      return res.send({success: 'Successfully updated user!'});
    });
  });
}

/**
 * Counts the number of users.
 */

function count(req, res) {
  Model('count', {}, function(data) {
    res.send({count: data});
  }, function(err) {
    res.send({error: 'Unable to get user count.'});
  });
}

function created( req , res){
  var dateFormat = 'M.DD';// 'M.dd'
  var data = {}; 
  var total = 0; 

  User.find({},
    {},
    {sort:{created:1}},
    function( err , users){
      if(err){
        res.send({error:'unable to get users'});
      }
      else{
        users.forEach(function(user){
          var created = moment.utc(user.created).format(dateFormat)
          //if the date has been seen, increment the number of created users on that day,
          //otherwise create a new entry for the date
          if( data.hasOwnProperty(created) ){
            data[created]++; 
            total++; 
          }
          else{
            data[created] = 1; 
            total++; 
          }

        })
        res.send( {data:data,total:total} )
      }
    })
}

function location( req, res){
  var data = {}; 

  User.find({},
    {},
    {sort:{created:1}},
    function( err , users){
      if(err){
        res.send({error:'unable to get users'});
      }
      else{
        users.forEach(function(user){
          var location = user.location; 
          //if the date has been seen, increment the number of created users on that day,
          //otherwise create a new entry for the date
          if( data.hasOwnProperty(location) ){
            data[location]++; 
          }
          else{
            data[location] = 1; 
          }

        })
        res.send( {data:data} )
      }
    })
}

function about(req,res){
  var about = []; 

  User.find({about:{$exists:true}},
    {'about':1},
    {},
    function(err,users){
      users.forEach( function(user){
        about.push(user.about);
      })

      res.send({data:about})
    })
}

//returns a list of all user._id values in the database.
//TODO: do we need to limit the number of docs we return 
function getAll(req,res){
  var blah; 

  console.log('getAll')
  blah = User.find(
    {},
    {},
    {sort: {created:1}}, // limit:1},
    function( err, users ){
      if(err){ 
        res.send({error : 'Unable to list Users'})
       }
       else{
        res.send(users)
        // res.send( users )
        // res.send(users)
       }
     }
    )
}

//how many users didn't finish setup?
function complete( req , res){
  Model('find', {about:{$exists:true} }, function(data){
    res.send( {data:data.length} );
  })
}

/**
 * Retrieves the user info.
 */

function info(req, res) {
  Model('findOne', {_id: req.params.id}, function(data) {
    res.send(data);
  }, function(err) {
    res.send({error: 'Unable to get user info.'});
  });
}

/**
 * Adds a tag to the specified user.
 */

function addTag(req, res) {
  var errorCallback = function(err) {
    res.send({error: 'Unable to add tag'});
  };

  Model('findOne', {_id: req.params.id}, function(user) {
    console.log('user is ' + user);

    var specifiedTag = decodeURI(req.params.tag);

    if(user.tags.indexOf(specifiedTag) < 0) {
      user.tags.push(specifiedTag);
    }

    user.save(function(errSave) {
      if(errSave) {
        errorCallback();
      }

      res.send({success: 'Successfully added tag!'});
    });
  }, errorCallback);
}

/**
 * Deletes a tag of the specified user.
 */

function delTag(req, res) {
  var errorCallback = function(err) {
    res.send({error: 'Unable to delete tag.'});
  };

  Model('findOne', {_id: req.params.id}, function(user) {
    // find the index of the tag to remove
    var tagIndex = user.tags.indexOf(decodeURI(req.params.tag));

    // check if tag was actually found then remove it
    if (tagIndex !== -1) {
      user.tags.splice(tagIndex, 1);
    }

    user.save(function(errSave) {
      if(errSave) {
        errorCallback();
      }

      res.send({success: 'Successfully deleted tag!'});
    });
  }, errorCallback);
}

/**
 * Retrieve the nearby users of the current user.
 */

function nearbyUsers(req, res) {
  // find the user with the specified id
  User.findOne(
    {_id: req.params.id}, { '_id': 0, 'nearbyUsers': 1, 'viewedUsers': 1},
    function(err, user) {
      // output an error message if an error occurs or
      // the user could not be found
      if(err || !user) {
        res.send({error: 'Unable to get nearby users.'});
      } else {
        if(user.viewedUsers === undefined) {
          user.viewedUsers = [];
        }

        // add the user to itself so that it doesn't return it's own info
        user.viewedUsers.push(req.params.id);

        // retrieve the user information of nearby users
        var query = User.find(
          {_id: {$nin: user.viewedUsers}},
          { '_id': 1,
            'email': 1,
            'firstName': 1,
            'lastName': 1,
            'picture': 1,
            'headline': 1,
            'location': 1,
            'viewedUsers': 1,
            'nearbyUsers': 1,
            'tags': 1,
            'organization': 1,
            'industry': 1,
            'about': 1,
            'extendedInfo': 1
        }).limit(50);
        
        // execute the query
        query.exec(function(userInfosErr, userInfos) {
            // output an error message if an error occurs or
            // the user infos could not be found
            if(userInfosErr || !userInfos) {
              res.send({error: 'Unable to get nearby users.'});
            }

            // sends the nearby users
            res.send({data: Util.shuffleArray(userInfos)});
        });
      }
    }
  );
}

/**
 * Mark the user as viewed by a specific user.
 */

function viewUser(req, res) {
  // find the user with the specified source id
  User.findOne(
    {_id: req.params.source},
    function(err, user) {
      // output an error message if an error occurs or
      // the target user could not be marked as viewed
      if(err || !user) {
        return res.send({error: 'Unable to mark user as viewed.'});
      }

      // create an array if the viewed users property does not already
      // have it assigned
      if(!user.viewedUsers) {
        user.viewedUsers = [];
      }

      // add the target user to the source user's array of viewed users
      user.viewedUsers.push(new ObjectId(req.params.target));

      // save the source user because we changed its state
      user.save(function(errSave) {
        // output an error if one occurs during the saving process
        if(errSave) {
          return res.send({error: 'Unable to mark user as viewed.'});
        }

        // creates a like if like = true is specified in the query string
        if(Boolean(req.query.like)) {
          Like.create(req, res);
        } else {
          // sends a success message if the user was sucessfully marked as viewed
          return res.send({success: 'Successfully marked user as viewed!'});
        }
      });
    }
  );
}

/**
 * Module exports.
 */

//jss
exports.getAll = getAll;
exports.complete = complete; 
//

exports.about = about; 
exports.create = create;
exports.edit = edit;
exports.count = count;
exports.created = created; 
exports.location = location; 
exports.info = info;
exports.updateInfo = updateInfo;
exports.addTag = addTag;
exports.delTag = delTag;
exports.nearbyUsers = nearbyUsers;
exports.viewUser = viewUser;
exports.clearUnreadNotificationsCount = clearUnreadNotificationsCount;
exports.incrementUnreadNotificationsCount = incrementUnreadNotificationsCount;
