
/**
 * Sets the default value of a property if it is undefined.
 *
 * @param {*} property
 * @param {*} value
 * @return {*}
 * @api public
 */

function setDefaultValue(property, value) {
  return typeof property !== 'undefined' ? property : value;
}

/**
 * Clones an object without altering the passed-in object.
 *
 * @param {Object} obj
 * @return {Object}
 * @api public
 */

function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Shuffles a specified array.
 *
 * Derived from Jonas Raoni Soares Silva [http://jsfromhell.com/array/shuffle]
 *
 * @param {Array} arr
 * @return {Array}
 * @api public
 */

function shuffleArray(arr) {
    for(
      var j, x, i = arr.length; i;
      j = Math.floor(Math.random() * i),
      x = arr[--i], arr[i] = arr[j], arr[j] = x
    );

    return arr;
}

/**
 * Module exports.
 */

exports.setDefaultValue = setDefaultValue;
exports.cloneObject = cloneObject;
exports.shuffleArray = shuffleArray;
