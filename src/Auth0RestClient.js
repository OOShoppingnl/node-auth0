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
          console.log('callback');
          if (err) return reject(err);
          return resolve(data);
        };
        arguments.push(callbackFunction)

        return self.client.getAll.apply(self.client, arguments);;
      })
      .catch(function (err) {
        console.log(err);
        return new Promise(function (errResolve, errReject) {
          errReject(err);
        });
      });
  });
};

module.exports = Auth0RestClient;
