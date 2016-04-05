var cpd = function () {
	this.type = "";

	if (window.chrome && chrome.runtime && chrome.runtime.id) {
		this.type = "chrome";
	}
};

//array of initial settings
//The name (key) is what will be used to save in storage AND the name
//used in the items array.
cpd.prototype.presets = {
	privateKey: false,
	publicKey: false,
	autofill: true,
	autologinFill: true,
	autologinSubmit: true,
	enableKeyLedger: true,
	keyLedgerUrl: null,
	keyLedgerVerified: false
};


cpd.prototype.get_presets = function () {
	return this.presets;
};


// Take a key and a value.. pass the result of "storing" to fn
cpd.prototype.get_saved = function (callback) {
	if (this.type === "chrome") {
		return this.chrome_get_saved(callback);
	}
};

cpd.prototype.save_settings = function (items, callback) {
	//TODO sanitize items before saving.
	if (this.type === "chrome") {
		return this.chrome_save_settings(items, callback);
	}
};

// Take a key and a value.. pass the result of "storing" to fn
cpd.prototype.chrome_get_saved = function (callback) {
	chrome.storage.sync.get(
			//object with Key:value pair of settings.
			//Saved will overwrite preset value.
			this.presets,
			//callback or return
					function (items) {
						//callback or return
						if (typeof callback === 'function') {
							return callback(items);
						} else {
							return items;
						}
					});
		};



cpd.prototype.chrome_save_settings = function (items, callback) {
	// Save all options
// stored in chrome.storage.

	//If undefined value, setting will not be saved.
	chrome.storage.sync.set(items, function () {
		//callback or return
		if (typeof callback === 'function') {
			callback(items);
		} else {
			return items;
		}
	});
};

//
cpd.prototype.pair_settings = function (items) {
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

