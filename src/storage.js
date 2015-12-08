
// Gets all saved options
// stored in chrome.storage.
function get_saved(callback) {
	chrome.storage.sync.get(getInitialSettings(),
			function (items) {
				//callback or return
				if (typeof callback === 'function') {
					callback(items);
				} else {
					return items;
				}
			});
}


// Save all options
// stored in chrome.storage.
//get_saved should be called before this function
//Otherwise user settings will be overwritten with default values.
function save_settings(items, callback) {

	chrome.storage.sync.set({
		privateKey: items.privateKey,
		publicKey: items.publicKey,
		autofill: items.autofill,
		autologin: items.autologin,
	}, function () {

		//callback or return
		if (typeof callback === 'function') {
			callback(items);
		} else {
			return items;
		}
	});

}

//Return initial settings.
function getInitialSettings(items) {

	presets = {
		privateKey: false,
		publicKey: false,
		autofill: true,
		autologin: true
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




