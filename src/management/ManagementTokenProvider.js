var RestClient = require('rest-facade').Client;
var Promise = require('bluebird');
var util = require('util');
var utils = require('../utils');
var jsonToBase64 = utils.jsonToBase64;
var ArgumentError = require('../exceptions').ArgumentError;
var memoizer = require('lru-memoizer');

var BASE_URL_FORMAT = 'https://%s';

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

  this.cacheEnabled = !!options.enableCaching;
  console.log('CacheEnabled', this.cacheEnabled);

  this.options = options;

  var managerOptions = {
    headers: {
      'User-agent': 'node.js/' + process.version.replace('v', ''),
      'Content-Type': 'application/json'
    },
    baseUrl: util.format(BASE_URL_FORMAT, options.domain)
  };

  if (options.telemetry !== false) {
    var telemetry = jsonToBase64(options.clientInfo || utils.getClientInfo());
    managerOptions.headers['Auth0-Client'] = telemetry;
  }

  this.resource = new RestClient(managerOptions.baseUrl + '/oauth/token', managerOptions);
}

/**
 * Return an object with information about the current client,
 *
 * @method    getAccessToken
 * @memberOf  module:management.ManagementTokenProvider.prototype
 *
 * @return {Promise}   Promise returning the access token.
 */
ManagementTokenProvider.prototype.getAccessToken = function () {
  var self = this;

  var options = {
    "client_id": this.options.clientID,
    "client_secret": this.options.clientSecret,
    "grant_type": 'client_credentials',
    "audience": 'https://dctoon-dev.auth0.com/api/v2/'
  };

  if (this.cacheEnabled && this.expiresAt && (new Date().getTime() < this.expiresAt)) {
    console.log('Get access_token from cache');
    return new Promise(function (resolve, reject) {
      return resolve(self.access_token);
    });
  }

  return new Promise(function (resolve, reject) {
    self.resource.create(options, function (err, data) {
      if (err) {
        return reject(err);
      }
      if (self.cacheEnabled) {
        self.access_token = data.access_token;
        self.expiresAt = data.expires_in * 1000 + new Date().getTime();
      }
      console.log(data.expires_in);
      return resolve(data.access_token);
    });
  });
};

module.exports = ManagementTokenProvider;
