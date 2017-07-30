var expect = require('chai').expect;
var nock = require('nock');

var ArgumentError = require('rest-facade').ArgumentError;
var APIError = require('rest-facade').APIError;
var RestClient = require('rest-facade').Client;

var ManagementTokenProvider = require('../../src/management/ManagementTokenProvider');


describe('ManagementTokenProvider', function () {

  it('should raise an error when no options object is provided', function () {
    expect(ManagementTokenProvider)
      .to.throw(ArgumentError, 'Management Token Provider options must be an object');
  });

  it('should raise an error when the domain is not set', function () {
    var provider = ManagementTokenProvider.bind(null, { clientID: 'clientID', clientSecret: 'clientSecret' });

    expect(provider)
      .to.throw(ArgumentError, 'Must provide a domain');
  });

  it('should raise an error when the domain is not valid', function () {
    var provider = ManagementTokenProvider.bind(null, { clientID: 'clientID', clientSecret: 'clientSecret', 'domain': '' });

    expect(provider)
      .to.throw(ArgumentError, 'Must provide a domain');
  });

  it('should raise an error when the clientID is not set', function () {
    var provider = ManagementTokenProvider.bind(null, { clientSecret: 'clientSecret', domain: 'domain' });

    expect(provider)
      .to.throw(ArgumentError, 'A clientID must be provided');
  });

  it('should raise an error when the clientID is not valid', function () {
    var provider = ManagementTokenProvider.bind(null, { clientID: '', clientSecret: 'clientSecret', 'domain': 'domain' });

    expect(provider)
      .to.throw(ArgumentError, 'A clientID must be provided');
  });

  it('should raise an error when the clientSecret is not set', function () {
    var provider = ManagementTokenProvider.bind(null, { clientID: 'clientID' , domain: 'domain' });

    expect(provider)
      .to.throw(ArgumentError, 'A clientSecret must be provided');
  });

  it('should raise an error when the clientSecret is not valid', function () {
    var provider = ManagementTokenProvider.bind(null, { clientID: 'clientID', clientSecret: '', 'domain': 'domain' });

    expect(provider)
      .to.throw(ArgumentError, 'A clientSecret must be provided');
  });

  describe('instance properties', function () {
    it('should expose an instance of resource', function () {
      var provider = new ManagementTokenProvider({ clientID: 'clientID', clientSecret: 'clientSecret', 'domain': 'domain' });
      expect(provider.resource)
        .to.exist
        .to.be.an.instanceOf(RestClient);
    });
  });


  describe('getCachedAccessToken', function(){
    var defaultConfig = { clientID: 'clientID', clientSecret: 'clientSecret', 'domain': 'auth0-node-sdk.auth0.com' };
    it('should handle network errors correctly', function (done) {   
      var config = defaultConfig;
      config.domain = 'domain';
      var client = new ManagementTokenProvider(config);

      client.getCachedAccessToken()
        .catch(function(err){
          expect(err)
            .to.exist
            .to.be.an.instanceOf(Error);
          expect(err.name).to.be.equal('APIError');
          done();
        });
    }); 

    it('should handle unauthorized errors correctly', function (done) {
      var client = new ManagementTokenProvider(defaultConfig);

      nock('https://' + defaultConfig.domain)
        .post('/oauth/token')
        .reply(401);

      client.getCachedAccessToken()
        .catch(function(err){
          expect(err)
            .to.exist
            .to.be.an.instanceOf(APIError);
          expect(err.statusCode).to.be.equal(401);
          done();
          nock.cleanAll();
        });
    }); 

    it('should return access token', function (done) {
      var config = defaultConfig;
      config.domain = 'auth0-node-sdk-1.auth0.com'
      var client = new ManagementTokenProvider(config);

      nock('https://' + config.domain)
        .post('/oauth/token')
        .reply(200, {
          access_token: 'token',
          expires_in: 100
        })

      client.getCachedAccessToken()
        .then(function(access_token){
          expect(access_token).to.exist;
          expect(access_token).to.be.equal('token');
          done();
          nock.cleanAll();
        });
    }); 

    it('should contain correct body payload', function (done) {
      var config = defaultConfig;
      config.domain = 'auth0-node-sdk-2.auth0.com'
      var client = new ManagementTokenProvider(defaultConfig);
      
       nock('https://' + config.domain)
        .post('/oauth/token',function(body, test, test2) {
          expect(body.client_id).to.equal('clientID');
          expect(body.client_secret).to.equal('clientSecret');
          expect(body.grant_type).to.equal('client_credentials');
          expect(body.audience).to.equal('https://auth0-node-sdk-2.auth0.com/api/v2/');
          return true;
        })
        .reply(function(uri, requestBody, cb) {
          return cb(null, [200, { access_token: 'token', expires_in: 100 }]);
        });

      client.getCachedAccessToken()
        .then(function(data){
          done();
          nock.cleanAll();
        });
    });

    it('should return access token from the cache the second call', function (done) {
      var config = defaultConfig;
      config.domain = 'auth0-node-sdk-3.auth0.com'
      var client = new ManagementTokenProvider(config);

      nock('https://' + config.domain)
        .post('/oauth/token')
        .once()
        .reply(200, {
          access_token: 'access_token',
          expires_in: 100
        })

      client.getCachedAccessToken()
        .then(function(access_token){
          expect(access_token).to.exist;
          expect(access_token).to.be.equal('access_token');

           client.getCachedAccessToken()
            .then(function(access_token){
              expect(access_token).to.exist;
              expect(access_token).to.be.equal('access_token');
              done();
              nock.cleanAll();
            });
        });
    }); 

    it('should request new access token when cache is expired', function (done) {
      var config = defaultConfig;
      config.domain = 'auth0-node-sdk-4.auth0.com'
      var client = new ManagementTokenProvider(config);

      nock('https://' + config.domain)
        .post('/oauth/token')
        .reply(200, {
          access_token: 'access_token',
          expires_in: 0.0001 //100ms
        })
        .post('/oauth/token')
        .reply(200, {
          access_token: 'new_access_token',
          expires_in: 100
        })

      client.getCachedAccessToken()
        .then(function(access_token){
          expect(access_token).to.exist;
          expect(access_token).to.be.equal('access_token');

          setTimeout(function() {
            client.getCachedAccessToken()
              .then(function(access_token){
                expect(access_token).to.exist;
                expect(access_token).to.be.equal('new_access_token');
                done();
                nock.cleanAll();
              });
          }, 150); // 150ms 
        });
    }); 
  });
});
