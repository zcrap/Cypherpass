// crypto.js holds pure cryptographic functions.
// No general plugin code should be in here.


// Supported signature algorithms
// Mainly due to kjur limitations.
// We will add others when they are supported by the kjur library
// or replacement.
// See https://kjur.github.io/jsjws/api/symbols/KJUR.jws.JWS.html#.sign
// for current supported list.
var supportedSignatureAlgorithms = [
  "HS256",
  "HS512",
  "RS256",
  "RS384",
  "RS512",
  "ES256",
  "ES384",
  "PS256",
  "PS384",
  "PS512"
];

// Intend to support in the future:
//"HS384",
// "ES512",
// "RSA1_5",
// "RSA-OAEP",
// "RSA-OAEP-256",
// "A128KW",
// "A192KW",
// "A256KW",
// "ECDH-ES",
// "ECDH-ES+A128KW",
// "ECDH-ES+A192KW",
// "ECDH-ES+A256KW",
// "A128GCMKW",
// "A192GCMKW",
// "A256GCMKW",
// "PBES2-HS256+A128KW",
// "PBES2-HS384+A192KW",
// "PBES2-HS512+A256KW",
// "EdDSA",
// "RSA-OAEP-384",
// "RSA-OAEP-512"


// newKeyPair generates a new jwk key pair and saves the settigns.
function newKeyPair(items, callback) {
  //if items is empty, initialize
  if (!items) {
    items = {};
  }

  // initilize and ensure blank keys.
  items.privateKey = "";
  items.publicKey = "";

  // Generate new keys and save them.
  return storage.save_settings(generateKeys(items), callback);
}





// Generate new jwk key pair.
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

  // rfc 7517 4.2, 4.3.
  // 4.3 says, "SHOULD NOT" use 4.2 with 4.3 (but if so, used consistenly),
  // but we never want to
  // allow signing keys to be used for encryption due to security concerns.
  // We don't see the harm in saying it both ways to make sure they are never
  // used for encryption.
  // 4.2 also only mentions public keys.  Since the private should never
  // be transmitted, having an explicit note of purpose is not a bad idea.
  jwkPub.use = "sig";
  jwkPub.key_ops = ["sign", "verify"];
  jwkPrv.use = "sig";
  jwkPrv.key_ops = ["sign", "verify"];

  // Store key pair to internal settings.
  items.publicKey = jwkPub;
  items.privateKey = jwkPrv;

  // Verify the newly generated key pair
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


// signMessage signs with private key.
// These three things must be set:
// items.message should be message to sign.
// items.privateKey should be key to sign with.
// items.signatureAlgorithm is alg to sign with.
//
// Adds items.signed, which is the whole signed jws, to items.
//
// Returns items.
function signMessage(items, callback) {
  console.log("Starting signMessage");
  console.log(items);

  var prvKeyObj = KEYUTIL.getKey(items.privateKey);

  // Test jws sign
  try {
    var sJWS = KJUR.jws.JWS.sign(null, {
      alg: items.signatureAlgorithm
    }, items.message, prvKeyObj);
  } catch (e) {
    //TODO should be an error?
    console.error("Error signing key.");
    console.error(e);
    update_status(e);
    return
  }
  items.signed = sJWS;

  //callback or return
  if (typeof callback === 'function') {
    return callback(items);
  } else {
    return items;
  }
}

// verifyMessage verifies a signed message.
// Returns boolean.
function verifyMessage(items) {
  try{
    console.log(items);
    var pubKeyObj = KEYUTIL.getKey(items.publicKey);
    console.log("end verifyMessage");
    var isValid = KJUR.jws.JWS.verify(items.signed, pubKeyObj);
    console.log(isValid);
    console.log("end verifyMessage");
  }catch(e){
    console.error(e);
    return e
  }

  return isValid;
}

// Verify keypair by attempting to sign message and verifying it.
// Returns boolean.
// items.privateKey and items.publicKey must be correct.
function verifyKeyPair(items) {
  if (!items.message || items.message == "") {
    items.message = Math.random();
  }

  // Return boolean.
  // Important: callback to verifyMessage function must be present.
  return signMessage(items, verifyMessage);
}

// double hash, Sha-256d
// return as hex
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
