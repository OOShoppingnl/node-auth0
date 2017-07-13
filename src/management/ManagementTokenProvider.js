var RestClient = require('rest-facade').Client;
var Promise = require('bluebird');
var util = require('util');
var memoizer = require('lru-memoizer');
var ArgumentError = require('rest-facade').ArgumentError;
var APIError =  require('rest-facade').APIError;
var utils = require('../utils');
var jsonToBase64 = utils.jsonToBase64;

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
 * Returns the access_token.
 *
 * @method    getCachedAccessToken
 * @memberOf  module:management.ManagementTokenProvider.prototype
 *
 * @return {Promise}   Promise returning the access token.
 */
ManagementTokenProvider.prototype.getCachedAccessToken = function () {
  var self = this;

  return new Promise(function (resolve, reject) {
    self.getCachedClientCredentialsGrant(self.options.domain, self.options.clientID, self.options.clientSecret)
      .then(function (data) {
        return resolve(data.access_token);
      }).catch(function (err) {
        return reject(err);
      });
  });
}

ManagementTokenProvider.prototype.getCachedClientCredentialsGrant = Promise.promisify(
  memoizer({
    load: function (domain, clientId, clientSecret, callback) {
      var options = {
        "client_id": clientId,
        "client_secret": clientSecret,
        "grant_type": 'client_credentials',
        "audience": 'https://' + domain + '/api/v2/'
      };

      this.resource.create(options)
        .then(function (data) {
          return callback(null, data);
        })
        .catch(function (err) {
          return callback(err);
        });
    },
    hash: function (domain, clientId) {
      return domain + '-' + clientId;
    },
    itemMaxAge: function (domain, clientId, clientSecret, data) {
      if(data.expires_in) return data.expires_in * 1000;
      return 1000;
    },
    max: 100,
    maxAge: 1000 * 60 // 1h
  })
);

module.exports = ManagementTokenProvider;
