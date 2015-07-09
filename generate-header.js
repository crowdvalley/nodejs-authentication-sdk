/*
 * Generate a token to authenticate with the Crowd Valley API
*/

var cvApi = require("./cv-api.js");
var https = require('https');

// Enter your Crowd Valley API Key and Secret
var apiKey = 'your-api-key';
var apiSecret = 'your-api-secret';

// Enter your Username and Password
var username = 'yourname@youremail.com';
var password = 'yourpassword';

// Enter your Network Name
var network = 'yournetworkname';

// Enter the API endpoint. This should be "https://sandbox.crowdvalley.com/v1" 
// unless you have a paid account with Crowd Valley and you are using the live API
var apiBase = "https://sandbox.crowdvalley.com/v1";

//
//
// No need to touch anything below this line
//
//

// if API is under Basic Authentication, enter BasicAuth username and password
var apiBasicUsername = '';
var apiBasicPassword = '';


function httpsGet(path, callback) {

    var authHeader = cvApi.createAuthHeader(apiKey,apiSecret,network,username,password,apiBasicUsername,apiBasicPassword);

    var options = {
        host: apiBase,
        port: 443,
        path: path,
        headers: authHeader
    };

    onDataCallback = function (response) {
        var result = '';

        response.on('data', function (chunk) {
            result += chunk
        });

        response.on('end', function () {
            callback(result)
        });


    }

    https.request(options, onDataCallback).on('error', function (e) {
        console.log(e);
    }).end();

}

httpsGet("/", function (result) {

    console.log(result);
});
