function restore_options(items) {
	items = get_saved(function (items) {
		document.getElementById('autofill').checked = items.autofill;
		document.getElementById('autologin').checked = items.autologin;
		document.getElementById('publicKey').textContent = items.publicKey;
	});

}


function save_options() {
	var items = {};
	items.autofill = document.getElementById('autofill').checked;
	items.autologin = document.getElementById('autologin').checked;

	update_status('Saving....');

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
			document.getElementById('signature').textContent = items.signed + ":" + items.publicKey;
		});
	});
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
	newKeyPair(null, restore_options);
	update_status('Saved new key pair');
}


//show the private key
function show_private_key() {
	update_status('Getting private key....');
	get_saved(function (items) {
		document.getElementById('privateKey').textContent = items.privateKey;
		set_blank_status();
	});
}


/////////////
//Page Events
/////////////

//Restore options when document is loaded.
document.addEventListener('DOMContentLoaded', restore_options);

//Auto save on checkboxes
document.getElementById('autofill').addEventListener("change", save_options);
document.getElementById('autologin').addEventListener("change", save_options);

//Sign message
//Sign on update
document.getElementById('messageToSign').addEventListener("input", sign_message);

//New Keypair
//Make sure the user knows what they are doing first.
document.getElementById('newKeyPair').addEventListener('click', newKeyPairOption);
//Actually do new keypair.
document.getElementById('newKeyPairDoubleCheck').addEventListener('click', newKeyPairDoubleCheck);

//Show the private key to the user
document.getElementById('showPrivateKey').addEventListener("click", show_private_key);

