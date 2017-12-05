// options.js is the javascript specifically for the options page.

// Main start.
// run only on the options page.
if (document.title === "Cypherpass Options") {
  optionPageInit();
}


// initialize initilizes any empty options and
// then restores option page with saved settings.
function initialize() {
  start(restore_options);
}

// refresh_gui updates the options page GUI to show the latest saved information
function refresh_gui(callback) {
  restore_options(null, callback);
}

function restore_options(items, callback) {
  // Get saved options first, then set GUI.
  items = storage.get_saved(function(items) {
    //Console log items here to see saved settings to console.
    document.getElementById('autofill').checked = items.autofill;
    $('#autologinFill').prop('checked', items.autologinFill);
    $('#autologinSubmit').prop('checked', items.autologinSubmit);

    document.getElementById('publicKey').textContent = JSON.stringify(items.publicKey);

    //Key Ledger
    document.getElementById('enableKeyLedger').checked = items.enableKeyLedger;
    document.getElementById('keyLedgerUrl').value = items.keyLedgerUrl;
    setKeyLedgerVerified(items.keyLedgerVerified)

    //$("#keyLedgerVerified").text();


    // Reset if showing private key.
    var pricon = document.getElementById('privateKey').textContent;
    if (pricon !== "" && pricon !== " ") {
      document.getElementById('privateKey').textContent = JSON.stringify(items.privateKey);
    } else {
      document.getElementById('privateKey').textContent = "";
    }

    // Reset signature
    // Only sign if there is a value.
    // Otherwise, ensure value is empty.
    if (document.getElementById('messageToSign').value !== '') {
      //items.signed
      sign_message();
    } else {
      document.getElementById('signature').textContent = "";
    }

    // Signature algorithm
    // First add supported algs to select box
    addSigAlg();
    // Set selected to saved.  If not saved, set to default.
    if (items.signatureAlgorithm == "") {
      console.log("Signature Algorithm not set.  Setting to default.");
      items.signatureAlgorithm = defaults.alg;
      console.log(items.signatureAlgorithm);
    } else {
      console.log(items.signatureAlgorithm);
      //Make sure it is supported.
      if (supportedSignatureAlgorithms.indexOf(items.signatureAlgorithm) === -1) {
        console.error("algorithm not suported.  Setting to default and saving.  ");
        items.signatureAlgorithm = defaults.alg;
        save_options();

      }
    }
    $("#signatureAlgorithm").val(items.signatureAlgorithm);



    //callback or return
    if (typeof callback === 'function') {
      return callback(items);
    } else {
      return items;
    }
  });
}




function save_options() {
  console.log("saving settings");
  var items = {};
  //Cypherpass behavior.
  items.autofill = $('#autofill').is(':checked');
  items.autologinFill = $('#autologinFill').is(':checked');
  items.autologinSubmit = $('#autologinSubmit').is(':checked');

  //Key Ledger
  items.enableKeyLedger = $('#enableKeyLedger').is(':checked');
  items.keyLedgerUrl = $("#keyLedgerUrl").attr("value")
  items.keyLedgerVerified = $("#keyLedgerVerified").attr("value");
  items.signatureAlgorithm = $("#signatureAlgorithm").val();

  update_status('Saving....');

  //save options using save settings in storage.js
  storage.save_settings(items, update_status('Settings Saved'));
}

// addSigAlg adds supported sig algs to the signature algorithm selector.
function addSigAlg() {
  $.each(supportedSignatureAlgorithms, function(key, value) {
    $('#signatureAlgorithm')
      .append($("<option></option>")
        .attr("value", value)
        .text(value));
  });
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
// Updates signature block with JWT.
function sign_message() {
  storage.get_saved(function(items) {
    update_status("Signing...");
    items.message = document.getElementById('messageToSign').value;
console.log(items);
    if (supportedSignatureAlgorithms.indexOf(items.signatureAlgorithm) === -1) {
      console.error("algorithm not suported or not set. Setting to default.");
      items.signatureAlgorithm = defaults.alg;

    }

    signMessage(items, function onSigned(items) {
      document.getElementById('signature').textContent = items.signed;
    });
  });
}









// Verify the message we just signed (self verify)
// TODO decapracate or rename.
function sign_message_self_verify() {

  document.getElementById('publicKey').textContent
  storage.get_saved(function(items) {
    update_status("Signing...");
    items.message = document.getElementById('messageToSign').value;

    signMessage(items, function(items) {
      json = {
        "public_key": items.publicKey,
        "message": items.message,
        "signed": items.signed
      };
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
  items.publicKey = JSON.parse(document.getElementById('verifyMessagePublicKey').value);
  items.signed = document.getElementById('verifyMessageMessage').value;
  // items.signed = document.getElementById('verifyMessageSignature').value;



  //Set the verification message
  var verifiedMessage = "";

  //Set background color to failed.
$( "#verifyMessageVerified" ).removeClass( "success" ).addClass( "danger" );

  //Attempt to verify
  try {
    if (verifyMessage(items) === true) {
      verifiedMessage = "Valid signature.";
      $("#verifyMessageVerified").removeClass( "danger" ).addClass("success");
    } else {
      verifiedMessage = "Invalid signature.";
    }
  } catch (e) {
    verifiedMessage = "Invalid signature. " + e;
  }

  document.getElementById('verifyMessageVerified').textContent = verifiedMessage;
}

// newKeyPairCheck
// Checkbox to make sure the user wants to create a new keypair.
// Creating a new keypair should be disabled until this is checked.
function newKeyPairCheck() {
  if (document.getElementById('newKeyPairCheck').checked === true) {
    document.getElementById('newKeyPair').disabled = false;
  } else {
    document.getElementById('newKeyPair').disabled = true;
  }
}


// Generate a new key pair.
function newKeyPairOption() {
  var items = {};
  items.signatureAlgorithm = $("#signatureAlgorithm").val();

  newKeyPair(items, refresh_gui);
  update_status('Generated new key pair.');
}


//show the private key
function show_private_key() {
  update_status('Getting private key....');
  storage.get_saved(function(items) {
    document.getElementById('privateKey').textContent = JSON.stringify(items.privateKey);
    document.getElementById('showPrivateKey').style.display = 'none';
    set_blank_status();
  });
}

// Blank private key afte showing.
function show_private_key_reset() {
  document.getElementById('privateKey').textContent = "";
  document.getElementById('showPrivateKey').style.display = 'initial';
}

// Manually import key pair.
// TODO should be able import solely based on a private key jwk since
// it include public key components.
function import_key_pair() {
  update_status('importing key pair....');

  var items = {};

  items.publicKey = document.getElementById('importPublicInput').value;
  items.privateKey = document.getElementById('importPrivateInput').value;

  var verified = verifyKeyPair(items);

  if (verified) {
    //Save the new key pair and update the options page.
    storage.save_settings(items, function() {
      refresh_gui(update_status('Imported new key pair.'));
    });
  } else {
    update_status('Invalide Key pair.  Pair not saved.  ');
  }
}



function key_ledger_verify() {
  var transaction = {};
  cyphernode.generate_transaction_json(transaction);

  storage.get_saved(function(items) {
    console.log("Verifing Key Ledger...");
    items.input = items.publicKey;
    items.output = items.publicKey;

    var trans = cyphernode.action_hashable_json(items);
    items.message = hash(trans);
    items.transaction_hashed = items.message;



    // signMessage(items, function(items) {
    //   var json = cyphernode.generate_transaction_json(items);
    //   console.log("Json to send to server: " + json);
    //
    //   $.post(items.keyLedgerUrl, json, function(data) {
    //     console.log("Post success");
    //     console.log(data);
    //     if (data.key_verified) {
    //       if (data.key_verified === "true" || data.key_verified === items.publicKey)
    //         setKeyLedgerVerified("Ledger last verified: " + Date(), true, true)
    //     } else {
    //       setKeyLedgerVerified("Key not verified..", false, true)
    //     }
    //
    //   }, "json").fail(function(data) {
    //     console.log("Post Failed.");
    //     console.log(data);
    //     setKeyLedgerVerified("Problem communicating with ledger.", false, true)
    //   });
    // });
  });
}

function setKeyLedgerVerified(s, status, save) {


  if (s && s != "false" && status != false) {
    $("#keyLedgerVerified")
      .text(s)
      .removeAttr()
      .css('color', 'green')
      .attr({
        "value": s
      });

  } else {
    if (!s) {
      s = "Unable to verify ledger."
    } else if (s == "false") {
      s = "Ledger not verified."
    }
    $("#keyLedgerVerified")
      .text(s)
      .removeAttr()
      .css({
        'color': 'red'
      })
      .attr({
        "value": false
      });
  }
  if (save) {
    save_options();
  }
}








// copyText is a helper function for copying HTML text based on ID
function copyText(elementID) {
  //Before we copy, we are going to select the text.
  var text = document.getElementById(elementID);
  var selection = window.getSelection();
  var range = document.createRange();
  range.selectNodeContents(text);
  selection.removeAllRanges();
  selection.addRange(range);
  //add to clipboard.
  document.execCommand('copy');
}







// testPage opens a new tab with the test page.
function testPage() {
  chrome.tabs.create({
    url: "/src/test.html"
  });
}

// optionsPageTab opens a new tab with the options page.
function optionsPageTab(){
  chrome.tabs.create({
    url: "/src/options.html"
  });
}

// selfVerify verifies a message in the tools sections.
// This helps the user confirm that a message is verifiable.
function selfVerify() {
  console.log("selfVerifyMessage");
  var sig = $("#signature").text();
  var pub = $("#publicKey").text();

  $("#verifyMessagePublicKey").val(pub);
  $("#verifyMessageMessage").val(sig);

  option_verify_signature();
}





// optionPageInit initializes the options page and restores settiongs
// when document is loaded.
function optionPageInit() {

  //TODO loaded should happen, then everything else.
  document.addEventListener('DOMContentLoaded', initialize);

  ///////////
  // Auto save
  ////////
  // Any item that should trigger a save should be below
  document.getElementById('autofill').addEventListener("change", save_options);

  $('#autologinFill').change(save_options);
  $('#autologinSubmit').change(save_options);

  document.getElementById('enableKeyLedger').addEventListener("change", save_options);
  document.getElementById('keyLedgerUrl').addEventListener("input", save_options);

  //Select Public Key
$('#selectPublicKey').click(function() {
  copyText('publicKey');
});

// Select signature algorithm
  $('#signatureAlgorithm').change(save_options);




  //////////////
  //Key Ledger
  /////////////

  $("#verifyKeyLedger").click(key_ledger_verify);


  // Sign message
  // Sign on update
  document.getElementById('messageToSign').addEventListener("input", sign_message);

  //Select signed
  document.getElementById('selectSigned').addEventListener("click", function() {
    copyText('signature');
  });

  // Verify the message we just signed
  $("#selfVerifyMessage").click(function() {
    selfVerify();
  });

  //Verify Signature
  //Verify on update
  document.getElementById('verifyMessageMessage')
    .addEventListener("input", option_verify_signature);
  document.getElementById('verifyMessagePublicKey')
    .addEventListener("input", option_verify_signature);
  // document.getElementById('verifyMessageSignature')
  //   .addEventListener("input", option_verify_signature);

  // New Keypair
  // Make sure the user knows what they are doing first.
  document.getElementById('newKeyPairCheck').addEventListener('click', newKeyPairCheck);
  //Actually do new keypair.
  document.getElementById('newKeyPair').addEventListener('click', newKeyPairOption);

  //Show the private key to the user
  document.getElementById('showPrivateKey').addEventListener("click", show_private_key);

  // Import key pair
  document.getElementById('importKeyPairButton').addEventListener("click", import_key_pair);

  //Test page new tab
  document.getElementById('testPage').addEventListener('click', testPage);

  //Options page new tab
  //document.getElementsByClassName('optionsPage').click(optionsPageTab);


  //Options page new tab
  $(".optionsPage").click(function() {
    optionsPageTab();
  });

}
