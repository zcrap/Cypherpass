
//run only on the options page.
if (document.title === "Cypherpass Options") {
	option_page();
}


function initialize() {
	//Run the main start.
	//This will initilize any empt options.
	//Then restore the otions page.
	start(restore_options);
}

//Update the options page GUI to show the latest saved information
function refresh_gui(callback) {
	restore_options(null, callback);
}

function restore_options(items, callback) {

	//Get saved options first, then set GUI.
	items = get_saved(function (items) {
		document.getElementById('autofill').checked = items.autofill;
		document.getElementById('autologin').checked = items.autologin;
		document.getElementById('publicKey').textContent = items.publicKey;
		//Key Ledger
		document.getElementById('enableKeyLedger').checked = items.enableKeyLedger;
		document.getElementById('keyLedgerUrl').value = items.keyLedgerUrl;


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

	items.autofill = document.getElementById('autofill').checked;
	items.autologin = document.getElementById('autologin').checked;

	//Key Ledger
	items.enableKeyLedger = document.getElementById('enableKeyLedger').checked;
	items.keyLedgerUrl = document.getElementById('keyLedgerUrl').value;

	update_status('Saving....');
	console.log("Saving items.keyLedgerUrl: " + items.keyLedgerUrl);

	save_settings(items, update_status('Settings Saved'));
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


//Sign a message manually in the options page.
function sign_message() {
	get_saved(function (items) {
		update_status("Signing...");
		items.message = document.getElementById('messageToSign').value;

		signMessage(items, function (items) {
			document.getElementById('signature').textContent
					= items.publicKey + '|' + items.signed + "|" + items.message;
		});
	});
}

//Verify signatures in the options page
function option_verify_signature() {
	var items = {};
	items.publicKey = document.getElementById('verifyMessagePublicKey').value;
	items.signed = document.getElementById('verifyMessageSignature').value;
	items.message = document.getElementById('verifyMessageMessage').value;

	//check to see if it was all dumped into pubkey.
	//TODO figure out good way to handle message escaping.
	var parts = items.publicKey.split("|");
	if (parts.length === 3) {
		items.publicKey = parts[0];
		items.signed = parts[1];
		items.message = parts[2];
	}

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
	get_saved(function (items) {
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
		save_settings(items, function () {
			refresh_gui(update_status('Imported new key pair.'));
		});
	} else {
		update_status('Invalide Key pair.  Pair not saved.  ');
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
	document.getElementById('autologin').addEventListener("change", save_options);

	document.getElementById('enableKeyLedger').addEventListener("change", save_options);
	document.getElementById('keyLedgerUrl').addEventListener("input", save_options);

	//Select Public Key
	document.getElementById('selectPublicKey').addEventListener("click", function () {
		copy_text('publicKey');
	});

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




