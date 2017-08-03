var RestClient = require('rest-facade').Client;
var Promise = require('bluebird');
var util = require('util');
var memoizer = require('lru-memoizer');
var ArgumentError = require('rest-facade').ArgumentError;
var APIError = require('rest-facade').APIError;
var utils = require('../utils');
var assign = Object.assign || require('object.assign');
var jsonToBase64 = utils.jsonToBase64;

var BASE_URL_FORMAT = 'https://%s';
var DEFAULT_OPTIONS = { useCache : true };

/**
 * @class ManagementTokenProvider
 * Auth0 Management API Token Provider.
 * @constructor
 * @memberOf module:management
 *
 * @param {Object} options                  Options for the ManagementTokenProvider.
 * @param {String} options.domain           ManagementClient server domain.
 * @param {String} options.clientID         Non Interactive Client Id.
 * @param {String} options.clientSecret     Non Interactive Client Secret.
 * @param {String} [options.useCache]       Enable caching (default true)
 * @example <caption>
 *   Initialize a Management Token Provider class.
 * </caption>
 *
 * var ManagementTokenProvider = require('auth0').ManagementTokenProvider;
 * var provider = new ManagementTokenProvider({
 *   clientID: '{YOUR_NON_INTERACTIVE_CLIENT_ID}',
 *   clientSecret: '{YOUR_NON_INTERACTIVE_CLIENT_SECRET}',
 *   domain: '{YOUR_ACCOUNT}.auth0.com'
 * });
 */
var ManagementTokenProvider = function (options) {
  var params = assign({}, DEFAULT_OPTIONS, options);
  if (!params.clientID || params.clientID.length === 0) {
    throw new ArgumentError('Must provide a Client Id');
  }

  if (!params.clientSecret || params.clientSecret.length === 0) {
    throw new ArgumentError('Must provide a Client Secret');
  }

  if (!params.domain || params.domain.length === 0) {
    throw new ArgumentError('Must provide a domain');
  }

  if(typeof params.useCache !== 'boolean'){
    throw new ArgumentError('The useCache must be a boolean');
  }
  
  this.options = params;
 
  var managerOptions = {
    headers: {
      'User-agent': 'node.js/' + process.version.replace('v', ''),
      'Content-Type': 'application/json'
    },
    baseUrl: util.format(BASE_URL_FORMAT, params.domain)
  };

  if (params.telemetry !== false) {
    var telemetry = jsonToBase64(params.clientInfo || utils.getClientInfo());
    managerOptions.headers['Auth0-Client'] = telemetry;
  }

  this.resource = new RestClient(managerOptions.baseUrl + '/oauth/token', managerOptions);
}

/**
 * Returns the access_token.
 *
 * @method    getAccessToken
 * @memberOf  module:management.ManagementTokenProvider.prototype
 *
 * @return {Promise}   Promise returning the access token.
 */
ManagementTokenProvider.prototype.getAccessToken = function () {
  
  if(this.options.useCache){
     return this.getCachedAccessToken(this.options.domain, this.options.clientID, this.options.clientSecret)
      .then(function (data) {
        return data.access_token
      });
  }else{
    return this.executeClientCredentialsGrant(this.options.domain, this.options.clientID, this.options.clientSecret)
    .then(function (data) {
        return data.access_token
      });
  } 
}

ManagementTokenProvider.prototype.getCachedAccessToken = Promise.promisify(
  memoizer({
    load: function (domain, clientId, clientSecret, callback) {

      this.executeClientCredentialsGrant(domain, clientId, clientSecret)
        .then(function (data) {
          callback(null, data);
        })
        .catch(function (err) {
          callback(err);
        });
    },
    hash: function (domain, clientId) {
      return domain + '-' + clientId;
    },
    itemMaxAge: function (domain, clientId, clientSecret, data) {
      if (data.expires_in) return data.expires_in * 1000;
      return 1000;
    },
    max: 100,
    maxAge: 1000 * 60 // 1h
  })
);

ManagementTokenProvider.prototype.executeClientCredentialsGrant = function (domain, clientId, clientSecret) {
  var options = {
    "client_id": clientId,
    "client_secret": clientSecret,
    "grant_type": 'client_credentials',
    "audience": 'https://' + domain + '/api/v2/'
  };

  return this.resource.create(options)
};

module.exports = ManagementTokenProvider;
