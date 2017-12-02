// storage.js holds code for storage.

// Crypto should always be stored locally.  No private key information
// should ever be transmitted from a device.
// See https://github.com/zamicol/cypherpass/wiki/Cypherpass-Principles-and-Philosophy

// TODO dunno what this was for.  Firefox?
var cpd = function() {
  this.type = "";

  if (window.chrome && chrome.runtime && chrome.runtime.id) {
    this.type = "chrome";
  }
};

// Main storage datastructure.
// We use this as our datastrucutre defintion of "items" used elsewhere in the
// plugin to prevent code duplication.
// presets is the array of settings
// values will be the initial settings.
// The name (key) is what will be used to save in storage
cpd.prototype.presets = {
  // Keys
  privateKey: false,
  publicKey: false,
  // Crypto
  signatureAlgorithm:false,
  // Plugin Settings
  autofill: true,
  autologinFill: true,
  autologinSubmit: true,
  enableKeyLedger: true,
  keyLedgerUrl: null,
  keyLedgerVerified: false
};

// get_presets is a getter function.
cpd.prototype.get_presets = function() {
  return this.presets;
};


// Take a key and a value.. pass the result of "storing" to fn
cpd.prototype.get_saved = function(callback) {
  if (this.type === "chrome") {
    return this.chrome_get_saved(callback);
  }
};

// save_settings saves settings to backend browser storage.
cpd.prototype.save_settings = function(items, callback) {
  //TODO sanitize items before saving.
  if (this.type === "chrome") {
    return this.chrome_save_settings(items, callback);
  }
};

// Take a key and a value.. pass the result of "storing" to fn
cpd.prototype.chrome_get_saved = function(callback) {
  chrome.storage.local.get(
    //object with Key:value pair of settings.
    //Saved will overwrite preset value.
    this.presets,
    //callback or return
    function(items) {
      //callback or return
      if (typeof callback === 'function') {
        return callback(items);
      } else {
        return items;
      }
    });
};


// Save to chrome specifically
// stored in chrome.storage.
// Do not call directly, instead use generic "save_settings".
cpd.prototype.chrome_save_settings = function(items, callback) {
  //If undefined value, setting will not be saved.
  chrome.storage.local.set(items, function() {
    //callback or return
    if (typeof callback === 'function') {
      callback(items);
    } else {
      return items;
    }
  });
};


cpd.prototype.pair_settings = function(items) {
  console.log("start pair settings");
  keys = Object.keys(this.presets);

  kv = {};

  for (index = 0; index < keys.length; ++index) {
    console.log(keys[index]);
    console.log(items[keys[index]]);
    kv[keys[index]] = items[keys[index]];
  }
  console.log(kv);
}
