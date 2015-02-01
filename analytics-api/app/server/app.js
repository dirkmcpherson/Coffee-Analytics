
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    mongoose = require('mongoose');

var app = express();

/**
 * Middleware.
 */

app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: 'authentication'}));
app.use(app.router);
app.use(express.errorHandler());

/**
 * Connect to database.
 */

mongoose.connect('mongodb://localhost/August12');

/**
 * Routes.
 */

require('./routes')(app);

/**
 * Start server.
 */

var server = http.createServer(app);
server.listen(app.get('port'));

/**
 * Sockets for messaging and push notifications.
 */

require('./../services/sockets').initialize(server);

/**
 * Module exports.
 */

module.exports = app;
