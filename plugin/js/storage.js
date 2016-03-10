
// Gets all saved options
// stored in chrome.storage.
// Returns all the saved options.
function get_saved(callback) {
	chrome.storage.sync.get(
			//object with Key:value pair of settings.
			//Saved will overwrite preset value.
			get_defaults(),
			//callback or return
					function (items) {
						//callback or return
						if (typeof callback === 'function') {
							return callback(items);
						} else {
							return items;
						}
					});
		}


// Save all options
// stored in chrome.storage.
function save_settings(items, callback) {

//If undefined value, setting will not be saved.
	chrome.storage.sync.set({
		privateKey: items.privateKey,
		publicKey: items.publicKey,
		autofill: items.autofill,
		autologin: items.autologin,
		enableKeyLedger: items.enableKeyLedger,
		keyLedgerUrl: items.keyLedgerUrl

	}, function () {
		//callback or return
		if (typeof callback === 'function') {
			callback(items);
		} else {
			return items;
		}
	});

}

//Get key:value array of all of our names variables
//value is default values.
function get_defaults(items) {

	//array of initial settings
	presets = {
		privateKey: false,
		publicKey: false,
		autofill: true,
		autologin: true,
		enableKeyLedger: true,
		keyLedgerUrl: null
	};

	return presets;
//TODO
//Check against items to see which have already been set.
//
//	var i;
//
//	for (i = 0; i < presets.length; i++) {
//		if (){
//
//		}
//	}
//
//	return items;
}




