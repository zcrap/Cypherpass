// content.js holds general purpose code for the plugin.

// This should be for functions that will execute during general plugin use.
// Page specific code, such as the options or test page, should go in its own file.


///////////////////
// Variables
///////////////////
// Defaults enumerates string values for default settings.
//
// Defaults are declared in storage.js
var defaults = {
  "alg": "ES256", // default alg. RFC7515, Section 4.1.1
  // Autofill values
  "autologFormName": "public_key_auth",
  "autologFeildName": "public_key",
  "sigFeildName": "signature",
  "challengeAttr": "data-public_key_challenge",

  // Depracate me: Old Default crypto
  //"sigalg": "SHA256withECDSA"
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
      // Generate new keypair and run.
      items = newKeyPair(items, function(items) {
        run(items, callback);
      });
    } else {
      // Settings have been loaded.
      // Run the rest of Cypherpass
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

// autoLogin is the main function for auto login.
function autoLogin(items) {
  // If the user has disabled autologin in the settings don't run
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
