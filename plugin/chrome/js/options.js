// run only on the options page.
if (document.title === "Cypherpass Options") {
	option_page();
}


function initialize() {
	//Run the main start.
	//This will initilize any empty options.
	//Then restore the otions page.
	start(restore_options);
}

// Update the options page GUI to show the latest saved information
function refresh_gui(callback) {
	restore_options(null, callback);
}

function restore_options(items, callback) {
	// Get saved options first, then set GUI.
	items = storage.get_saved(function (items) {
		//Console log items here to see saved settings to console.
		document.getElementById('autofill').checked = items.autofill;
		$('#autologinFill').prop('checked', items.autologinFill);
		$('#autologinSubmit').prop('checked', items.autologinSubmit);

		document.getElementById('publicKey').textContent = items.publicKey;
		//Key Ledger
		document.getElementById('enableKeyLedger').checked = items.enableKeyLedger;
		document.getElementById('keyLedgerUrl').value = items.keyLedgerUrl;
		setKeyLedgerVerified(items.keyLedgerVerified)

		//$("#keyLedgerVerified").text();


		//Reset if showing private key.
		var pricon = document.getElementById('privateKey').textContent;
		if (pricon !== "" && pricon !== " ") {
			document.getElementById('privateKey').textContent = items.privateKey;
		} else {
			document.getElementById('privateKey').textContent = "";
		}

		//Reset signature
		//Only sign if there is a value.
		//Otherwise, ensure value is empty.
		if (document.getElementById('messageToSign').value !== '') {
			//items.signed
			sign_message();
		} else {
			document.getElementById('signature').textContent = "";
		}

		//callback or return
		if (typeof callback === 'function') {
			return callback(items);
		} else {
			return items;
		}
	});
}




function save_options() {
	var items = {};
	//Cypherpass behavior.
	items.autofill = document.getElementById('autofill').checked;
	items.autologinFill = $('#autologinFill').is(':checked');
	items.autologinSubmit = $('#autologinSubmit').is(':checked');

	//Key Ledger
	items.enableKeyLedger = document.getElementById('enableKeyLedger').checked;
	items.keyLedgerUrl = document.getElementById('keyLedgerUrl').value;
	items.keyLedgerVerified = $("#keyLedgerVerified").attr("value");

	update_status('Saving....');

	//save options using save settings in storage.js
	storage.save_settings(items, update_status('Settings Saved'));
}


function update_status(message, timeout) {
	//set default timeout.
	if (!timeout) {
		timeout = 1200;
	}

	// Update status to let user know options were saved.
	var status = document.getElementById('status');
	status.textContent = message;

	setTimeout(set_blank_status, timeout);
}


function set_blank_status() {
	var status = document.getElementById('status');
	//set back to empty space.
	status.textContent = '\xa0';
}


// Sign a message manually in the options page.
function sign_message() {
	storage.get_saved(function (items) {
		update_status("Signing...");
		items.message = document.getElementById('messageToSign').value;

		signMessage(items, function (items) {
			json = {"public_key": items.publicKey, "message": items.message, "signed": items.signed};
			json = JSON.stringify(json);
			document.getElementById('signature').textContent = json
		});
	});
}























// Verify the message we just signed (self verify)
function sign_message_self_verify() {


document.getElementById('publicKey').textContent


	storage.get_saved(function (items) {
		update_status("Signing...");
		items.message = document.getElementById('messageToSign').value;

		signMessage(items, function (items) {
			json = {"public_key": items.publicKey, "message": items.message, "signed": items.signed};
			json = JSON.stringify(json);
			document.getElementById('signature').textContent = json
		});
	});
}


/////////////////////////////
// Verify signatures in the options page
////////////////////////////
function option_verify_signature() {
	var items = {};
	items.publicKey = document.getElementById('verifyMessagePublicKey').value;
	items.signed = document.getElementById('verifyMessageSignature').value;
	items.message = document.getElementById('verifyMessageMessage').value;

	//allow the first feild to have json object input with all components
	try {
		json = JSON.parse(items.publicKey);

		if (json.public_key) {
			items.publicKey = json.public_key;
		}

		if (json.message) {
			items.message = json.message;
		}

		//Support "challenge" terminology as well as alias for message.
		//Message to overwrite if exists.
		if (json.challenge) {
			items.message = json.challenge;
		}

		if (json.signed) {
			items.signed = json.signed;
		}
	} catch (e) {
		//It's not json.
	}

	//Set the verification message
	var verifiedMessage = "";
	var divStyle = document.getElementById('verifyMessageVerified')
			.parentElement.parentElement.style;
	//Set background color to failed.
	divStyle.backgroundColor = "#ffcccc";

	//Attempt to verify
	try {
		if (verifyMessage(items) === true) {
			verifiedMessage = "Valid signature.";
			divStyle.backgroundColor = "greenyellow";
		} else {
			verifiedMessage = "Invalid signature.";
		}
	} catch (e) {
		verifiedMessage = "Invalid signature. " + e;
	}

	document.getElementById('verifyMessageVerified').textContent
			= verifiedMessage;
}



//User must check in acknowledgement that they want to create new key pair.
function newKeyPairDoubleCheck() {
	//Is the checkbox checked?
	if (document.getElementById('newKeyPairDoubleCheck').checked === true) {
		document.getElementById('newKeyPair').disabled = false;
	} else {
		document.getElementById('newKeyPair').disabled = true;
	}
}


//Generate a new key pair.
function newKeyPairOption() {
	newKeyPair(null, refresh_gui);
	update_status('Saved new key pair');
}


//show the private key
function show_private_key() {
	update_status('Getting private key....');
	storage.get_saved(function (items) {
		document.getElementById('privateKey').textContent = items.privateKey;
		document.getElementById('showPrivateKey').style.display = 'none';
		set_blank_status();
	});
}

//show the private key reset
function show_private_key_reset() {
	document.getElementById('privateKey').textContent = "";
	document.getElementById('showPrivateKey').style.display = 'initial';
}

//Manually import key pair.
function import_key_pair() {
	update_status('importing key pair....');

	var items = {};

	items.publicKey = document.getElementById('importPublicInput').value;
	items.privateKey = document.getElementById('importPrivateInput').value;

	var verified = verifyKeyPair(items);

	if (verified) {
		//Save the new key pair and update the options page.
		storage.save_settings(items, function () {
			refresh_gui(update_status('Imported new key pair.'));
		});
	} else {
		update_status('Invalide Key pair.  Pair not saved.  ');
	}
}



function key_ledger_verify() {
	var transaction = {};
	cyphernode.generate_transaction_json(transaction);

	storage.get_saved(function (items) {
		console.log("Verifing Key Ledger...");
		items.input = items.publicKey;
		items.output = items.publicKey;

		var trans = cyphernode.action_hashable_json(items);
		items.message = hash(trans);
		items.transaction_hashed = items.message;



		signMessage(items, function (items) {
			var json = cyphernode.generate_transaction_json(items);
			console.log("Json to send to server: " + json);

			$.post(items.keyLedgerUrl, json, function (data) {
				console.log("Post success");
				console.log(data);
				if (data.key_verified) {
					if (data.key_verified === "true" || data.key_verified === items.publicKey)
						setKeyLedgerVerified("Ledger last verified: " + Date(), true, true)
				} else {
					setKeyLedgerVerified("Key not verified..", false, true)
				}

			}, "json").fail(function (data) {
				console.log("Post Failed.");
				console.log(data);
				setKeyLedgerVerified("Problem communicating with ledger.", false, true)
			});
		});
	});
}

function setKeyLedgerVerified(s, status, save) {


	if (s && s != "false" && status != false) {
		$("#keyLedgerVerified")
				.text(s)
				.removeAttr()
				.css('color', 'green')
				.attr({"value": s});

	} else {
		if (!s) {
			s = "Unable to verify ledger."
		} else if (s == "false") {
			s = "Ledger not verified."
		}
		$("#keyLedgerVerified")
				.text(s)
				.removeAttr()
				.css({'color': 'red'})
				.attr({"value": false});
	}
	if (save) {
		save_options();
	}
}
















function copy_text(element) {
	//Before we copy, we are going to select the text.
	var text = document.getElementById(element);
	var selection = window.getSelection();
	var range = document.createRange();
	range.selectNodeContents(text);
	selection.removeAllRanges();
	selection.addRange(range);
	//add to clipboard.
	document.execCommand('copy');
}







////Set button link to new test page tab
function test_page() {
	chrome.tabs.create({url: "/src/test.html"});
}

//Set button link to new options page tab
function options_page() {
	chrome.tabs.create({url: "/src/options.html"});
}







/////////////
//Page Events
/////////////

function option_page() {
	//Restore options when document is loaded.
	//TODO loaded should happen, then everything else.
	document.addEventListener('DOMContentLoaded', initialize);

	///////////
	//Auto save
	////////
	document.getElementById('autofill').addEventListener("change", save_options);

	$('#autologinFill').change(save_options);
	$('#autologinSubmit').change(save_options);

	document.getElementById('enableKeyLedger').addEventListener("change", save_options);
	document.getElementById('keyLedgerUrl').addEventListener("input", save_options);

	//Select Public Key
	document.getElementById('selectPublicKey').addEventListener("click", function () {
		copy_text('publicKey');
	});


	//////////////
	//Key Ledger
	/////////////

	$("#verifyKeyLedger").click(key_ledger_verify);



	//Sign message
	//Sign on update
	document.getElementById('messageToSign').addEventListener("input", sign_message);

	//Select signed
	document.getElementById('selectSigned').addEventListener("click", function () {
		copy_text('signature');
	});

	//Verify Signature
	//Verify on update
	document.getElementById('verifyMessageMessage')
			.addEventListener("input", option_verify_signature);
	document.getElementById('verifyMessagePublicKey')
			.addEventListener("input", option_verify_signature);
	document.getElementById('verifyMessageSignature')
			.addEventListener("input", option_verify_signature);

	//New Keypair
	//Make sure the user knows what they are doing first.
	document.getElementById('newKeyPair').addEventListener('click', newKeyPairOption);
	//Actually do new keypair.
	document.getElementById('newKeyPairDoubleCheck').addEventListener('click', newKeyPairDoubleCheck);

	//Show the private key to the user
	document.getElementById('showPrivateKey').addEventListener("click", show_private_key);

	//Import key pair
	document.getElementById('importKeyPairButton').addEventListener("click", import_key_pair);

	//Test page new tab
	document.getElementById('testPage').addEventListener('click', test_page);

	//Options page new tab
	document.getElementById('optionsPage').addEventListener('click', options_page);

}
