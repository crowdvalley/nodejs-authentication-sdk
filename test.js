var assert = require('assert');
var cvApi = require("./cv-api.js");
var apiKey = 'testapikey-001';
var apiSecret = 'ap1s3cr3t';
var username = 'test@test.com';
var password = 'testtest';
var network = 'testnetwork';
var apiBase = "https://sandbox.crowdvalley.com/v1";
var apiBasicUsername = '';
var apiBasicPassword = '';

var authHeader = cvApi.createAuthHeader(apiKey,apiSecret,network,username,password,apiBasicUsername,apiBasicPassword);

assert.equal(authHeader["cv-auth"].match(/Username=\"\w+@\w+.\w+\"/)[0].split("=")[1], '"test@test.com"', 'E-Mails don\'t match!')
assert.equal(authHeader["cv-auth"].match(/Password=\"\w+=\"/)[0].split("=\"")[1], 'FRVCB0cGAUc', 'Passwords don\'t match!')
console.log('√ works')
