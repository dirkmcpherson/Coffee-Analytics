
/**
 * Module dependencies.
 */

var User = require('./../controllers/user'),
    Tag = require('./../controllers/tag'),
    Conversation = require('./../controllers/conversation');
    Message = require('./../controllers/message'),
    Admin = require('./../controllers/admin');
    Like = require('./../controllers/like')

/**
 * Module exports.
 */

module.exports = function(app) {

  /**
  * WARNING!
  * Reset/Drop all collections
  */

  //allow access from websites
  app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });


  if(process.env.NODE_ENV !== 'production') {
    app.get('/reset', Admin.auth, Admin.reset);
    app.get('/user/count', User.count);
    app.get('/usage', Admin.usageDate)
    app.get('/matches', Admin.matches)
    app.get('/macro', Admin.macroData)
    app.get('/message/usage',Message.usage)
    app.get('/message/usagedate', Message.usageDate)
    app.get('/like/usage',Like.usage)
    app.get('/like/usagedate',Like.usageDate)
    app.get('/user/about',User.about)
    app.get('/user/created', User.created)
    app.get('/user/location', User.location)

    //analytics routes
    app.get('/user', User.getAll)
    app.get('/like/:source', Like.getAll) //get all likes from a source
    app.get('/like/:source/:target', Like.exists)
    app.get('/message/count', Message.retrieveCount)
    app.get('/message/:id', Message.retrieve) 
    app.get('/user/complete', User.complete)
  }

  /**
   * Internal.
   */

  app.get('/tag', Tag.list);
  app.post('/tag/:text', Tag.create);
  app.del('/tag/:text', Tag.del);
  
  /**
   * User Profile.
   */

  app.post('/user', User.create);
  app.get('/user/:id', User.info);
  app.put('/user/:id', User.edit);
  app.put('/user/:id/extendedinfo', User.updateInfo);
  app.post('/user/:id/tag/:tag', User.addTag);
  app.del('/user/:id/tag/:tag', User.delTag);

  /**
   * Matches.
   */

  app.get('/user/:id/nearby', User.nearbyUsers);
  app.post('/user/:source/view/:target', User.viewUser);

  /**
   * Messaging.
   */

  app.get('/user/:id/conversation', Conversation.list);
  app.del('/user/:id/conversation/:target', Conversation.del);
  app.get('/user/:source/conversation/:target', Message.list);

  /**
   * Deprecated.
   */

  app.get('/message/:source/:target', Message.list);
  app.post('/like/:source/:target',require('./../controllers/like').create);

  /**
   * Handle non-existant endpoints.
   */

  app.get('*', nonExistantEndpoint);
  app.post('*', nonExistantEndpoint);
  app.put('*', nonExistantEndpoint);
  app.del('*', nonExistantEndpoint);

  function nonExistantEndpoint(req, res) {
    res.send(404, {error: 'Endpoint does not exist.'});
  }
};
