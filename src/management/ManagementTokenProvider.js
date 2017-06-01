var ArgumentError = require('../exceptions').ArgumentError;
var utils = require('../utils');
var Promise = require('bluebird');

/**
 * @class ManagementTokenProvider
 * Auth0 Management API Token Provider.
 * @constructor
 * @memberOf module:management
 *
 * @param {Object} options                  Options for the ManagementTokenProvider.
 * @param {String} options.domain           ManagementClient server domain.
 * @param {String} [options.clientID]       Non Interactive Client Id.
 * @param {String} [options.clientSecret]   Non Interactive Client Secret.
 * @example <caption>
 *   Initialize your client class with an API v2 token (you can generate one
 *   <a href="https://auth0.com/docs/apiv2">here</a>) and a domain.
 * </caption>
 *
 * var ManagementClient = require('auth0').ManagementClient;
 * var auth0 = new ManagementTokenProvider({
 *   clientID: '{YOUR_NON_INTERACTIVE_CLIENT_ID}',
 *   clientSecret: '{YOUR_NON_INTERACTIVE_CLIENT_SECRET}'
 *   domain: '{YOUR_ACCOUNT}.auth0.com'
 * });
 */
var ManagementTokenProvider = function (options) {
  if (!options || typeof options !== 'object') {
    throw new ArgumentError('Management Token Provider options must be an object');
  } 

  if (!options.clientID || options.clientID.length === 0) {
    throw new ArgumentError('A clientID must be provided');
  }
     
  if (!options.clientSecret || options.clientSecret.length === 0) {
    throw new ArgumentError('A clientSecret must be provided');
  }

  if (!options.domain || options.domain.length === 0) {
    throw new ArgumentError('Must provide a domain');
  }

  this.options = options;
}


/**
 * Return an object with information about the current client,
 *
 * @method    getToken
 * @memberOf  module:management.ManagementTokenProvider.prototype
 *
 * @return {Promise}   Promise returning the access token.
 */
ManagementTokenProvider.prototype.getAccessToken = function () {
  var settings = {
    url : "https://dctoon-dev.auth0.com/oauth/token"
  }
  console.log('====================================');
  console.log('getAccessToken');
  console.log('====================================');
  return new Promise(function(resolve, reject){
    console.log('====================================');
    console.log('return access token');
    console.log('====================================');
    resolve('');
  });
};

module.exports = ManagementTokenProvider;
