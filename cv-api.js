var crypto = require('crypto');

var scramble1 = "! #$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";
var scramble2 = "f^jAE]okIOzU[2&q1{3`h5w_794p@6s8?BgP>dFV=m D<TcS%Ze|r:lGK/uCy.Jx)HiQ!#$~(;Lt-R}Ma,NvW+Ynb*0X";

var adj = 1.75;  // this value is added to the rolling fudgefactors
var mod = 3;     // if divisible by this the adjustment is made negative

var fudgefactor;

var exports = module.exports = {};

// ****************************************************************************
// This is not needed, but for checking, if encryption is reversible...
function _decrypt (secretKey, encryptedPassword) {

    if (typeof encryptedPassword=='undefined' || encryptedPassword==null || encryptedPassword.length==0) {
        console.log('No value has been supplied for encryption');
        process.exit(1);
    }

    // this is global var
    fudgefactor = _convertKey(secretKey); // convert secretKey into a sequence of numbers

    var target = '';
    var factor2 = 0;

    for (var i = 0; i < encryptedPassword.length; i++) {

        var char2=encryptedPassword.charAt(i);
        var num2=scramble2.indexOf(char2);

        if (num2 ==-1) {
            console.log('Key contains an invalid character '+char2);
            process.exit(1);
        } // if

        var _adj=_applyFudgeFactor();  // get an adjustment value using $fudgefactor

        var factor1 = factor2 + _adj;             // accumulate in $factor1
        var num1    = num2-Math.round(factor1);     // generate offset for $scramble2
        num1    = _checkRange(num1);   // check range
        factor2 = factor1 + num2;            // accumulate in $factor2


        var char1=scramble1.charAt(num1); // extract (multibyte) character from $scramble2

        // append to $target string
        target += char1;

    } // for

    return target.trim();

} // decrypt

// ****************************************************************************
// encrypt string into a garbled form

function _encrypt (secretKey, sourcePassword, targetLen) {

    if (typeof sourcePassword=='undefined' || sourcePassword==null || sourcePassword.length==0) {
        console.log('No value has been supplied for encryption');
        process.exit(1);
    }

    if (typeof targetLen=='undefined' || targetLen==null || targetLen==0) {
        console.log('Encryption length is not supplied');
        process.exit(1);
    }

    // this is global var
    fudgefactor = _convertKey(secretKey); // convert secretKey into a sequence of numbers

    //console.log(fudgefactor);
    //Right pad...
    sourcePassword=sourcePassword+Array(targetLen+1-sourcePassword.length).join(' '); // pad sourcePassword with spaces up to targetLen

    var target = '';
    var factor2 = 0;

    for (var i = 0; i < targetLen; i++) {

        var char1=sourcePassword.charAt(i);
        var num1=scramble1.indexOf(char1);

        if (num1 ==-1) {
            console.log('Key contains an invalid character '+char1);
            process.exit(1);
        } // if

        var _adj=_applyFudgeFactor();  // get an adjustment value using $fudgefactor

        var factor1 = factor2 + _adj;             // accumulate in $factor1
        var num2    = Math.round(factor1) + num1;     // generate offset for $scramble2

        num2    = _checkRange(num2);   // check range
        factor2 = factor1 + num2;            // accumulate in $factor2

        var char2=scramble2.charAt(num2); // extract (multibyte) character from $scramble2

        // append to $target string
        target += char2;

        //console.log('char1='+char1+' num1='+num1+' adj='+_adj+' factor1='+factor1+' num2='+num2+' char2='+char2+' factor2='+factor2);
        //echo "char1=$char1, num1=$num1, adj= $adj, factor1= $factor1, num2=$num2, char2=$char2, factor2= $factor2<br />\n";

    } // for

    return target;

} // encrypt

function _float2int (value) {
    return value | 0;
}

// return an adjustment value  based on the contents of $fudgefactor
function _applyFudgeFactor () {

    var fudge = parseInt(fudgefactor.shift());     // extract 1st number from array
    fudge = fudge + adj;           // add in adjustment value
    //console.log('mod applied fudge='+fudge+' mod='+mod);
    fudgefactor.push(fudge); // put it back at end of array

    if (typeof mod!=='undefined') {               // if modifier has been supplied
        //this comparison should be made using only the whole number part... otherwise not compatible with php % syntax.
        if (_float2int(fudge) % _float2int(mod) == 0) {     // if it is divisible by modifier
            fudge = fudge * -1;           // make it negative
        } // if
    } // if

    return fudge;

} // _applyFudgeFactor

// check that $num points to an entry in $this->scramble1
function _checkRange (num) {

    var numInt = Math.round(num);         // round up to nearest whole number

    var limit = scramble1.length;

    while (numInt >= limit) {
        numInt = numInt - limit;   // value too high, so reduce it
    } // while
    while (numInt < 0) {
        numInt = numInt + limit;   // value too low, so increase it
    } // while

    return numInt;

} // _checkRange

function _convertKey (key) {
    if (typeof key=='undefined' || key==null || key.length==0) {
        console.log('No value has been supplied for the encryption key');
        process.exit(1);
    }

    var keyArray=[];
    keyArray.push(key.length);

    var tot = 0;
    for (var i = 0; i < key.length; i++) {

        var char=key.charAt(i);
        var num=scramble1.indexOf(char);

        if (num ==-1) {
            console.log('Key contains an invalid character '+char);
            process.exit(1);
        } // if

        keyArray.push(num);
        tot += num;     // accumulate total for later
    } // for

    keyArray.push(tot); // insert total as last entry in array

    return keyArray;

} // _convertKey

function _getW3CDate(date) {
    var yyyy = date.getUTCFullYear();
    var mm = (date.getUTCMonth() + 1);
    if (mm < 10) mm = "0" + mm;
    var dd = (date.getUTCDate());
    if (dd < 10) dd = "0" + dd;
    var hh = (date.getUTCHours());
    if (hh < 10) hh = "0" + hh;
    var mn = (date.getUTCMinutes());
    if (mn < 10) mn = "0" + mn;
    var ss = (date.getUTCSeconds());
    if (ss < 10) ss = "0" + ss;
    return yyyy+"-"+mm+"-"+dd+"T"+hh+":"+mn+":"+ss;

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
    var nonce64 = new Buffer(nonce).toString('base64')

    var userPass64 = new Buffer(userPass).toString('base64')
    //var created ="2015-05-09T09:10:06Z";
    var created = _getW3CDate(new Date());
    var sha1Sum = crypto.createHash('sha1');
    sha1Sum.update(nonce + created + apiSecret);

    var digest = sha1Sum.digest('base64');

    var token = "AuthToken ApiKey=\""
        + apiKey + "\", TokenDigest=\""
        + digest + "\", Nonce=\""
        + nonce64 + "\", Created=\""
        + created + "\", Username=\""
        + userName + "\", Password=\""
        + userPass64 + "\"";

    return token;
}

exports.createAuthHeader=function(apiKey,apiSecret,network,username,password,apiBasicUsername,apiBasicPassword) {
        var encryptedPass = _encrypt(apiSecret, password, 16);
        var token = _createToken(apiKey, apiSecret, username, encryptedPass);
        var headers={};

        if (apiBasicUsername !== '') {
            var auth = 'Basic ' + new Buffer(apiBasicUsername + ':' + apiBasicPassword).toString('base64');
            headers['Authorization'] = auth;
        }

        headers['network']=network;
        headers['cv-auth']=token;

        //console.log(headers);

        return headers;

}
