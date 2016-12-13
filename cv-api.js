var crypto = require('crypto');

var exports = module.exports = {};

function chr (codePt) {

  if (codePt > 0xFFFF) { // Create a four-byte string (length 2) since this code point is high
    //   enough for the UTF-16 encoding (JavaScript internal use), to
    //   require representation with two surrogates (reserved non-characters
    //   used for building other characters; the first is "high" and the next "low")
    codePt -= 0x10000
    return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF))
  }
  return String.fromCharCode(codePt)
}

function _encrypt (secretKey, sourcePassword, targetLen) {
    // Our plaintext/ciphertext

    var bytes = [];
    var charCode;

    var myBuffer = [];
    var str = secretKey;
    var buffer = new Buffer(secretKey, 'utf8');
    for (var i = 0; i < buffer.length; i++) {
        myBuffer.push(buffer[i]);
    }

    // Our output text
    var outText = '';
    // Iterate through each character
    for(var i = 0; i < myBuffer.length; i) {
      for(var j = 0; ( j < sourcePassword.length && i < myBuffer.length ); j++, i++) {
          outText += chr(myBuffer[i]^sourcePassword[j].charCodeAt(0));
      }
    }
    return outText;
}

function _getW3CDate(date) {
  return new Date().toISOString().replace(/\..+/, '')+'+00:00';
}

function _createNonce(nonceLen) {
    var chars = "123456789abcdefghijklmnopqrstuvwxyz";
    var rnd = crypto.randomBytes(nonceLen)
            , value = new Array(nonceLen)
            , len = chars.length;

        for (var i = 0; i < nonceLen; i++) {
            value[i] = chars[rnd[i] % len]
        };

        var md5sum = crypto.createHash('md5');
        md5sum.update(value.join(''),'utf8');

        return md5sum.digest('hex');
}

function _createToken(apiKey,apiSecret,userName,userPass) {

    var nonce = _createNonce(10);
    var userPass64 = new Buffer(userPass, 'ascii').toString('base64')
    var created = _getW3CDate(new Date());
    var sha1Sum = crypto.createHash('sha1');
    sha1Sum.update(nonce + created + apiSecret);
    var digest = sha1Sum.digest('base64');

    var token = "AuthToken ApiKey=\"" + apiKey + "\", TokenDigest=\"" + digest + "\", Nonce=\""+ nonce + "\", Created=\"" + created + "\", Username=\"" + userName + "\", Password=\"" + userPass64 + "\"";

    return token;
}

exports.createAuthHeader=function(apiKey,apiSecret,network,username,password,apiBasicUsername,apiBasicPassword) {
        var encryptedPass = _encrypt(password, apiSecret, 16);
        var token = _createToken(apiKey, apiSecret, username, encryptedPass);
        var headers={};

        if (apiBasicUsername !== '') {
            var auth = 'Basic ' + new Buffer(apiBasicUsername + ':' + apiBasicPassword).toString('base64');
            headers['Authorization'] = auth;
        }

        headers['network']=network;
        headers['cv-auth']=token;

        return headers;
}
