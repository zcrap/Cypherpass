// content.js hold general purpose code for the plugin.
// Page specific code should go in its own file.


///////////////////
//Default Settings
///////////////////
// Defaults enumerates string values for default settings.
var defaults = {
  // Default crypto
  "curve": "P-256",
  "sigalg": "SHA256withECDSA",
  // Autofill values
  "autologFormName": "public_key_auth",
  "autologFeildName": "public_key",
  "sigFeildName": "signature",
  "challengeAttr": "data-public_key_challenge"
}


// Storage
// See cpd.prototype.presets in storage.js for save settings type,
// named "items" here.
var storage = new cpd()



///////////////////
// Initial startup
///////////////////
// Don't run on the options page.
if (document.title !== "Cypherpass Options") {
  start();
}



//Get saved settings and run rest of Cypherpass
function start(callback) {
  //get saved options.
  storage.get_saved(function(items) {
    // Do we have saved settings?
    // If empty, we havn't saved yet.
    //
    // Make sure "items" is initilized first with empty values.
    // running "cpd.get_saved" first initilizes empty "items"
    if (!items.privateKey || !items.publicKey) {
      console.log(
        "Unable to retreive key pair.",
        "Generating and saving new key."
      );
      //Generate new keypair and run.
      items = newKeyPair(items, function(items) {
        run(items, callback);
      });
    } else {
      //Settings have been loaded.
      //Run the rest of Cypherpass
      run(items, callback);
    }
  });
}


//Run the plugin actions.
function run(items, callback) {
  //Don't auto login if asking for public key.
  if (!autoFill(items)) {
    //perform autologin
    autoLogin(items);
  }

  //callback or return
  if (typeof callback === 'function') {
    return callback(items);
  } else {
    return items;
  }
}


//generate new key pair and save the settigns.
function newKeyPair(items, callback) {
  //if items is empty, initialize
  if (!items) {
    items = {};
  }

  //initilize blank keys.
  items.privateKey = "";
  items.publicKey = "";

  //Generate new keys and save them.
  return storage.save_settings(generateKeys(items), callback);
}









// Generate new key pair.
function generateKeys(items, callback) {
  var ec = new KEYUTIL.generateKeypair("EC", defaults.curve);

  var jwkPub = KEYUTIL.getJWKFromKey(ec.pubKeyObj);
  var jwkPrv = KEYUTIL.getJWKFromKey(ec.prvKeyObj);

  // Example valid JWK provided at this point.
  //
  // Public key:
  // {
  //   kty: "EC",
  //   crv: "P-256",
  //   x: "FYvutYH9DccAzN88vUzLop7l-zsM2uIN2kn7B_LLU_w",
  //   y: "bFL4_eqkqPnzh9BkZ7muEGk5ydQyMIRPhOWAIc6lijc",
  // }
  //
  // Private key:
  // {
  //   kty: "EC",
  //   crv: "P-256",
  //   x: "FYvutYH9DccAzN88vUzLop7l-zsM2uIN2kn7B_LLU_w",
  //   y: "bFL4_eqkqPnzh9BkZ7muEGk5ydQyMIRPhOWAIc6lijc",
  //   d: "fqr3fxw1oIEHm5eSxUq98Vk8_OpThHPHKeVALb3SxLs"
  // }

  // rfc 7517 4.2 plus 4.3.
  // 4.3 says, "SHOULD NOT" use 4.2 with 4.3 (but if so, used consistenly),
  // but we never want to
  // allow signing keys to be used for encryption due to security concerns.
  // We don't see the harm in saying it both ways to make sure they are never
  // used for encyrption.
  // 4.2 also only mentions public keys.  Since the private should never
  // be transmitted, having a local record of the use is not a bad idea.
  jwkPub.use = "sig";
  jwkPub.key_ops = ["sign", "verify"];
  jwkPrv.use = "sig";
  jwkPrv.key_ops = ["sign", "verify"];
  console.log(jwkPub);
  console.log(jwkPrv);

  var prvKeyObj = KEYUTIL.getKey(jwkPrv);
  var pubKeyObj = KEYUTIL.getKey(jwkPub);
  console.log(prvKeyObj);



  //Test sign

  var sJWS = KJUR.jws.JWS.sign(null, {
    alg: "ES256"
  }, {
    age: 21
  }, prvKeyObj);


  console.log(sJWS);
  var isValid = KJUR.jws.JWS.verify(sJWS, pubKeyObj);
  console.log(isValid);

  var verify = KJUR.jws.JWS.verify(sJWS, jwkPub, "ES256");

  console.log(verify);





  // TODO stopped here


  //Old
  var ec = new KJUR.crypto.ECDSA({
    "curve": defaults.curve
  });
  var keypair = ec.generateKeyPairHex();


  //Store key pair to items.
  items.privateKey = keypair.ecprvhex;
  items.publicKey = keypair.ecpubhex;

  var ec = new KJUR.crypto.ECDSA({
    "curve": defaults.curve
  });
  var keypair = ec.generateKeyPairHex();

  //Store key pair to items.
  items.privateKey = keypair.ecprvhex;
  items.publicKey = keypair.ecpubhex;

  //Verify the newly generated key pair
  var verified = verifyKeyPair(items);

  //If not verified, throw new error
  if (!verified) {
    throw "Newly generated key pair was invalid.  \n\
				Something is wrong.";
  }

  //callback or return
  if (typeof callback === 'function') {
    return callback(items);
  } else {
    return items;
  }
}

function autoFill(items) {
  //If the user has disabled autoFill in the settings don't run
  if (!items.autofill === true) {
    return false;
  }

  var inputs = document.getElementsByName(defaults.autologFeildName);
  if (inputs.length === 0) {
    return false;
  } else {
    inputs[0].value = items.publicKey;
    return true;
  }
}


function autoLogin(items) {

  //If the user has disabled autologin in the settings don't run
  if (!items.autologinFill === true) {
    return false;
  }

  // Find input with data-public_key_auth_challenge
  // If exists, complete challenge and send it back.
  var input = $("input[" + defaults.challengeAttr + "]");
  if (input) {
    //Get challenge value
    items.message = input.attr(defaults.challengeAttr);
    if (items.message) {
      console.log("Found public key authentication challenge: " + items.message);
      items = signMessage(items, function(items) {
        return items;
      });
      input.val('{"public_key":"' + items.publicKey + '","challenge":"' + items.message + '","signed":"' + items.signed + '"}');
      //Autosubmit the form
      if (items.autologinSubmit === true) {
        input.closest("form").submit();
      }
    }
  }
}


function signMessage(items, callback) {

  try {
    var sig = new KJUR.crypto.Signature({
      "alg": defaults.sigalg
    });
  } catch (e) {
    update_status(e);
  }

  sig.initSign({
    'ecprvhex': items.privateKey,
    'eccurvename': defaults.curve
  });
  sig.updateString(items.message);
  var sigValueHex = sig.sign();
  items.signed = sigValueHex;

  //callback or return
  if (typeof callback === 'function') {
    return callback(items);
  } else {
    return items;
  }
}

//verify message
//Returns boolean
function verifyMessage(items) {
  var sig = new KJUR.crypto.Signature({
    "alg": defaults.sigalg,
    "prov": "cryptojs/jsrsa"
  });
  sig.initVerifyByPublicKey({
    'ecpubhex': items.publicKey,
    'eccurvename': defaults.curve
  });
  sig.updateString(items.message);
  return sig.verify(items.signed);
}

//  Verify keypair by attempting to sign message and verifying it.
//  Returns boolean value.
function verifyKeyPair(items) {
  if (!items.message) {
    items.message = Math.random();
  }

  //Returns boolean
  return signMessage(items, verifyMessage);
}

//double hash
//return as hex
function hash(token) {
  var hasher = new KJUR.crypto.MessageDigest({
    alg: "sha256",
    prov: "cryptojs"
  });
  //first round
  roundOne = hasher.digestString(token);

  //second round
  var hasher2 = new KJUR.crypto.MessageDigest({
    alg: "sha256",
    prov: "cryptojs"
  });
  //roundOne result is given as hex.
  roundTwo = hasher2.digestHex(roundOne)

  return roundTwo;
}
