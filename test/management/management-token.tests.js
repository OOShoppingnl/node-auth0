var expect = require('chai').expect;
var nock = require('nock');

var ArgumentError = require('rest-facade').ArgumentError;
var APIError = require('rest-facade').APIError;
var RestClient = require('rest-facade').Client;

var ManagementTokenProvider = require('../../src/management/ManagementTokenProvider');


describe.only('ManagementTokenProvider', function () {

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


  describe('executeClientCredentialsGrant', function(){

    it('should handle network errors correctly', function (done) {
      var client = new ManagementTokenProvider({ clientID: 'clientID', clientSecret: 'clientSecret', 'domain': 'domain' });

      client.executeClientCredentialsGrant()
        .catch(function(err){
          expect(err)
            .to.exist
            .to.be.an.instanceOf(Error);
          expect(err.name).to.be.equal('APIError');
          done();
        });
    }); 

    it('should handle unauthorized errors correctly', function (done) {
      var client = new ManagementTokenProvider({ clientID: 'clientID', clientSecret: 'clientSecret', 'domain': 'auth0-node-sdk.auth0.com' });

      nock('https://auth0-node-sdk.auth0.com')
        .post('/oauth/token')
        .reply(401);

      client.executeClientCredentialsGrant()
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
      var client = new ManagementTokenProvider({ clientID: 'clientID', clientSecret: 'clientSecret', 'domain': 'auth0-node-sdk.auth0.com' });

      var test = nock('https://auth0-node-sdk.auth0.com')
        .post('/oauth/token')
        .reply(200, {
          access_token: 'token'
        })

      client.executeClientCredentialsGrant()
        .then(function(data){
          expect(data).to.exist;
          expect(data.access_token).to.exist;
          expect(data.access_token).to.be.equal('token');
          done();
          nock.cleanAll();
        });
    }); 

    it('should contain body payload', function (done) {
    var client = new ManagementTokenProvider({ clientID: 'clientID', clientSecret: 'clientSecret', 'domain': 'auth0-node-sdk.auth0.com' });

    var test = nock('https://auth0-node-sdk.auth0.com')
      .post('/oauth/token', {
        "client_id": 'clientID',
        "client_secret": 'clientSecret',
        "grant_type": 'client_credentials',
        "audience": 'https://auth0-node-sdk.auth0.com/api/v2/'
      })
      .reply(200, {
        access_token: 'token'
      })

    client.executeClientCredentialsGrant()
      .then(function(data){
        done();
        nock.cleanAll();
      });
    });
  });
});
