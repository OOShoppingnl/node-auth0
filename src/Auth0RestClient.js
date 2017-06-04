var RestClient = require('rest-facade').Client;
var Promise = require('bluebird');

var Auth0RestClient = function (resourceUrl, options, provider) {
  this.options = options;
  this.provider = provider;
  this.client = new RestClient(resourceUrl, options);
};

Auth0RestClient.prototype.getAll = function ( /* [params], [callback] */ ) {
  var self = this;
  return new Promise(function (resolve, reject) {

    self.provider.getAccessToken()
      .then(function (token) {
        self.options.headers['Authorization'] = 'Bearer ' + token;

        arguments = arguments && [];
        var callbackFunction = function (err, data) {
          if (err) return reject(err);
          return resolve(data);
        };
        arguments.push(callbackFunction);

        self.client.getAll.apply(self.client, arguments);;
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

module.exports = Auth0RestClient;
