
/**
 * Module dependencies.
 */

var Tag = require('./../models/tag');

/**
 * Resource methods.
 */

/**
 * Retrieves a list of all the tags.
 */

function list(req, res) {
  Tag.find({}, {'_id': 0, 'text': 1}, function(err, tags) {
    // output an error message if an error occurs
    if(err) {
      res.send({error: 'Unable to list tags.'});
    }

    // array to hold the texts of tags
    var results = [];
    
    // push the text of the tags to the result array
    tags.forEach(function(tag) {
      results.push(tag.text);
    });

    // sort the tag list alphabetically
    results.sort(function(a, b){
      var tempA = a.toLowerCase();
      var tempB = b.toLowerCase();

      if (tempA < tempB) {
        return -1;
      }
      
      if (tempA > tempB) {
        return 1;
      }
      
      return 0;
    });

    // return the results array sorted by alphabetical order
    res.send({data: results});
  });
}

/**
 * Creates a tag.
 */

function create(req, res) {
  // checks if the tag exists
  Tag.count({text: req.params.text}, function(errCount, count) {
    if(errCount) {
      // return the error if one occurred during the counting process
      return res.send({error: 'Unable to create tag.'});
    } else if(count > 0) {
      // returns an error if it already exists
      return res.send({error: 'Tag already exists.'});
    }

    // save the new tag
    new Tag({text: req.params.text}).save(function(errSave) {
      // returns an error if it could not be created
      if(errSave) {
        return res.send({error: 'Unable to create tag.'});
      }

      // sends a success message if successfully created
      return res.send({success: 'Tag successfully created!'});
    });
  });
}

/**
 * Deletes a tag.
 */

function del(req, res) {
  Tag.findOneAndRemove({text: req.params.text}, function(err) {
     // return the error if one occurred
    if(err) {
      res.send({error: 'Unable to remove tag.'});
    }
    
    // sends a success message if successfully removed
    res.send({success: 'Successfully removed tag!'});
  });
}

/**
 * Module exports.
 */

exports.list = list;
exports.create = create;
exports.del = del;
