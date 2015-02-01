
/**
 * Callback for APNS connection.
 *
 * @api private
 */

function connected() {
  console.log('Connected to APNS.');
}

/**
 * Callback for APNS transmission.
 *
 * @api private
 */

function transmitted(notification, device) {
  console.log('Notification transmitted to: ' + device.token.toString('hex'));
}

/**
 * Callback for APNS transmission error.
 *
 * @api private
 */

function transmissionError(errorCode, notification, device) {
  console.error('Notification caused error: ' + errorCode);
  console.log(' for device ' + device, notification);
}

/**
 * Callback for APNS timeout.
 *
 * @api private
 */

function timeout() {
  console.log('Connection Timeout from APNS.');
}

/**
 * Callback for APNS disconnect.
 *
 * @api private
 */

function disconnected() {
  console.log('Disconnected from APNS.');
}

/**
 * Adds event listeners to APNS.
 *
 * @param {Object} service
 * @api public
 */

function addEventListener(service) {
  service.on('connected', connected);
  service.on('transmitted', transmitted);
  service.on('transmissionError', transmissionError);
  service.on('timeout', timeout);
  service.on('disconnected', disconnected);
  service.on('socketError', console.error);
}

/**
 * Module Exports.
 *
 * @param {Object} service
 * @api public
 */

module.exports = addEventListener;
