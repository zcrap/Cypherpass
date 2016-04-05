var cpd = function () {
	this.type = "";

	if (window.chrome && chrome.runtime && chrome.runtime.id) {
		this.type = "chrome";
	}
};

//array of initial settings
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
cpd.prototype.store = function (key, val, fn) {
	if (this.type === "chrome") {
		//chrome.store
	}
};


// Take a key and a value.. pass the result of "storing" to fn
cpd.prototype.get_saved = function (callback) {
	if (this.type === "chrome") {
		return this.chrome_get_saved(callback);
	}
};

cpd.prototype.save_settings = function (items, callback) {
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
	chrome.storage.sync.set({
		privateKey: items.privateKey,
		publicKey: items.publicKey,
		autofill: items.autofill,
		autologinFill: items.autologinFill,
		autologinSubmit: items.autologinSubmit,
		enableKeyLedger: items.enableKeyLedger,
		keyLedgerUrl: items.keyLedgerUrl,
		keyLedgerVerified: items.keyLedgerVerified

	}, function () {
		//callback or return
		if (typeof callback === 'function') {
			callback(items);
		} else {
			return items;
		}
	});
};

