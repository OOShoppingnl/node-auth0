var RestClient = require('rest-facade').Client;
var Promise = require('bluebird');

var Auth0RestClient = function (resourceUrl, options, provider) {
  this.options = options;
  this.provider = provider;
  this.client = new RestClient(resourceUrl, options);
  this.wrapProvider = function (method, args) {
    if (!this.provider) {
      return this.client[method].apply(this.client, args);
    }

    var self = this;
    return new Promise(function (resolve, reject) {

      self.provider.getCachedAccessToken()
        .then(function (access_token) {
          self.options.headers['Authorization'] = 'Bearer ' + access_token;

          args = args && [];
          var callbackFunction = function (err, data) {
            if (err) return reject(err);
            return resolve(data);
          };
          args.push(callbackFunction);

          self.client[method].apply(self.client, args);;
        })
        .catch(function (err) {
          console.log('getCachedAccessToken err', err);
          reject(err);
        });
    });
  }
};

Auth0RestClient.prototype.getAll = function ( /* [params], [callback] */ ) {
  return this.wrapProvider('getAll', arguments);
};


Auth0RestClient.prototype.get = function ( /* [params], [callback] */ ) {
  return this.wrapProvider('get', arguments);
}

Auth0RestClient.prototype.create = function ( /* [params], [callback] */ ) {
  return this.wrapProvider('create', arguments);
}

Auth0RestClient.prototype.patch = function ( /* [params], [callback] */ ) {
  return this.wrapProvider('patch', arguments);
}

Auth0RestClient.prototype.update = function ( /* [params], [callback] */ ) {
  return this.wrapProvider('update', arguments);
}

Auth0RestClient.prototype.delete = function ( /* [params], [callback] */ ) {
  return this.wrapProvider('delete', arguments);
}

module.exports = Auth0RestClient;
