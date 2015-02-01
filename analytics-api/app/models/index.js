
/**
 * Module dependencies.
 */

var Util = require('./../../util/util');

/**
 * Imports a model that returns a function that takes in a success
 * and error callback.
 *
 * @param {String} model 
 * @api public
 */

function importModel(model) {
  // import the specified model
  model = require('./' + model.toLowerCase());

  // return a function that the user calls to interact with the model
  return function(command, query, successCb, errorCb) {
    // call the command with the specified query on the model
    model[command](query, function(err, data) {
      if(err || !data) {
        // call the error callback if an error occurs
        errorCb(err);
      } else {
        // call the success callback if everything is successful
        successCb(data);
      }
    });
  };
}

/**
 * Module exports.
 */

module.exports = importModel;
