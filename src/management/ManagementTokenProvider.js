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
  return new Promise(function(resolve, reject){
    //resolve('test');
    console.log('Get a new token');
    console.log('Got it!');
    resolve('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlJEY3dNVU0yUlVVMk1URTROa0ZGTWpBNE9EYzJOVEF4TlVReFJVSTRNamRHUWpoRU9FTTVNUSJ9.eyJpc3MiOiJodHRwczovL2RjdG9vbi1kZXYuYXV0aDAuY29tLyIsInN1YiI6Im5LYU94RGxYdHp3Y3lTc0M0N1NzdFA0WDNCR2pRRWEzQGNsaWVudHMiLCJhdWQiOiJodHRwczovL2RjdG9vbi1kZXYuYXV0aDAuY29tL2FwaS92Mi8iLCJleHAiOjE0OTYzNjUxMTgsImlhdCI6MTQ5NjM1NjUxOCwic2NvcGUiOiJyZWFkOmNsaWVudF9ncmFudHMgY3JlYXRlOmNsaWVudF9ncmFudHMgZGVsZXRlOmNsaWVudF9ncmFudHMgdXBkYXRlOmNsaWVudF9ncmFudHMgcmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgZGVsZXRlOnVzZXJzIGNyZWF0ZTp1c2VycyByZWFkOnVzZXJzX2FwcF9tZXRhZGF0YSB1cGRhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGRlbGV0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgY3JlYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBjcmVhdGU6dXNlcl90aWNrZXRzIHJlYWQ6Y2xpZW50cyB1cGRhdGU6Y2xpZW50cyBkZWxldGU6Y2xpZW50cyBjcmVhdGU6Y2xpZW50cyByZWFkOmNsaWVudF9rZXlzIHVwZGF0ZTpjbGllbnRfa2V5cyBkZWxldGU6Y2xpZW50X2tleXMgY3JlYXRlOmNsaWVudF9rZXlzIHJlYWQ6Y29ubmVjdGlvbnMgdXBkYXRlOmNvbm5lY3Rpb25zIGRlbGV0ZTpjb25uZWN0aW9ucyBjcmVhdGU6Y29ubmVjdGlvbnMgcmVhZDpyZXNvdXJjZV9zZXJ2ZXJzIHVwZGF0ZTpyZXNvdXJjZV9zZXJ2ZXJzIGRlbGV0ZTpyZXNvdXJjZV9zZXJ2ZXJzIGNyZWF0ZTpyZXNvdXJjZV9zZXJ2ZXJzIHJlYWQ6ZGV2aWNlX2NyZWRlbnRpYWxzIHVwZGF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgZGVsZXRlOmRldmljZV9jcmVkZW50aWFscyBjcmVhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIHJlYWQ6cnVsZXMgdXBkYXRlOnJ1bGVzIGRlbGV0ZTpydWxlcyBjcmVhdGU6cnVsZXMgcmVhZDplbWFpbF9wcm92aWRlciB1cGRhdGU6ZW1haWxfcHJvdmlkZXIgZGVsZXRlOmVtYWlsX3Byb3ZpZGVyIGNyZWF0ZTplbWFpbF9wcm92aWRlciBibGFja2xpc3Q6dG9rZW5zIHJlYWQ6c3RhdHMgcmVhZDp0ZW5hbnRfc2V0dGluZ3MgdXBkYXRlOnRlbmFudF9zZXR0aW5ncyByZWFkOmxvZ3MgcmVhZDpzaGllbGRzIGNyZWF0ZTpzaGllbGRzIGRlbGV0ZTpzaGllbGRzIHVwZGF0ZTp0cmlnZ2VycyByZWFkOnRyaWdnZXJzIHJlYWQ6Z3JhbnRzIGRlbGV0ZTpncmFudHMgcmVhZDpndWFyZGlhbl9mYWN0b3JzIHVwZGF0ZTpndWFyZGlhbl9mYWN0b3JzIHJlYWQ6Z3VhcmRpYW5fZW5yb2xsbWVudHMgZGVsZXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRzIGNyZWF0ZTpndWFyZGlhbl9lbnJvbGxtZW50X3RpY2tldHMgcmVhZDp1c2VyX2lkcF90b2tlbnMifQ.TPJnSA7SAWhbiEBE6WxHYYttpHRMw36WkW0bb3Jq9uZ92_BtmTJ6dzPNz_Q5lu7GibraVdeB_lpvrQfV_XSi2IdHm9EzdMPEbZaofxZozH_0zf2lUkvJCq3Mk-2Ql2XZsRU0ABxTaxFiNs9i4miW97t_BLwudRWStaCw_3jwv0UNceDGzeAqw3aaJ1x3fa8wOtps40hVp-4hDn8lU22Lz9u-ivlxHOrLlVtB9Pe1-aCAApzA6fzL4hZmKRmRdCIGg16C_0Mfcyhul5-x2g8eL34m_iEESNdPwi_-b-RUXW75enFAstIP1z0pfxC9juQ-D2Q3UIaOTduelOaoUFayGw');
  });
};

module.exports = ManagementTokenProvider;
