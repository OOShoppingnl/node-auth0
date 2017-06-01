var RestClient = require('rest-facade').Client;

var Auth0RestClient = function (resourceUrl, options) {
 

  


  options.headers['Authorization'] = 'Bearer ' + 
  //  var managerOptions = {
  //   headers: {
  //     'Authorization': 'Bearer ' + options.token,
  //     'User-agent': 'node.js/' + process.version.replace('v', ''),
  //     'Content-Type': 'application/json'
  //   },
  //   baseUrl: util.format(BASE_URL_FORMAT, options.domain)
  // };


  return new RestClient(resourceUrl, options);
};

module.exports = Auth0RestClient;