document.addEventListener('DOMContentLoaded', test_page);


function test_page() {

	//Add a sample test report to make sure it's working.
	add_test_report({
		"name": "Test function.",
		"passed": true,
		"message": "Test messsages go here."
	});

	//Get current saved settigns and run tests.
	get_saved(run_tests);
}

function run_tests(items) {
	test(test_get_saved, "Saved variables", items);
	test(test_signing, "Valid signature", items);
	test(test_autofill, "Test autofil function", items);
	test(test_saving, "Saving variables", items);
	test(test_restore, "Restoring settings", items);
}

function test(func, name, items) {
	func(new_test_object(name), items, add_test_report);
}

//Add the test report to the test page.
function add_test_report(test) {

	//Check to see if test object is valid.
	if (typeof test === "undefined") {
		throw "Undefined test objected.";
	}
	if (test.message === "undefined") {
		throw "Test message is undefined.  Invalid test.";
	}
	if (test.name === "undefined") {
		throw "Test name is undefined.  Invalid test.";
	}

	//Div to put the test report in.
	var div = document.createElement("div");
	//Message to print out on body of test report.
	var message;
	//title of the test report
	var title = document.createElement("h1");
	//Add the name of the test to the div
	title.appendChild(document.createTextNode(test.name));
	div.appendChild(title);

	//If message is a string, print literal contents.
	//If array, pring line by line.
	if (test.message instanceof Array) {
		message = document.createElement("div");

		//convert test.message from array to string.
		var messageContent = "";
		for (var i = 0; i < test.message.length; i++) {
			var paragraph = document.createElement("p");
			paragraph.appendChild(document.createTextNode(test.message[i]));
			message.appendChild(paragraph);
		}

		//Append paragraph to the message div.
		test.message = messageContent;
	} else {
		//Print message as is.
		message = document.createElement("pre");

		//Use built in formatting for objects.
		//Else print as is.
		if (typeof test.message === "object") {
			message.appendChild(document.createTextNode(JSON.stringify(test.message, null, 4)));
		} else {
			message.appendChild(document.createTextNode(test.message));
		}
	}

	div.appendChild(message);

	//p tag to display status and set div color.
	var status = document.createElement("p");

	if (test.passed !== true) {
		div.setAttribute("class", "failed");
		status.appendChild(document.createTextNode("Status: Failed"));
	} else {
		div.setAttribute("class", "passed");
		status.appendChild(document.createTextNode("Status: Passed"));
	}

	div.appendChild(status);

	document.getElementById("testResults").appendChild(div);
}


//Return a new test object
function new_test_object(name) {
	return {
		"name": name,
		"passed": false,
		"message": []
	};
}



/////////////////
//tests
//
//Each test should accept these parameters:
//test object, items array, callback.
//
/////////////////
function test_get_saved(test, items, callback) {

	get_saved(function (items) {
		test.message = items;

		if (
				items.autofill !== "undefined" &&
				items.autologin !== "undefined" &&
				items.publicKey !== "undefined" &&
				items.privateKey !== "undefined"
				) {
			test.passed = true;
		}

		//callback
		callback(test);
	});
}

function test_signing(test, items, callback) {
	//Sets boolean value
	test.passed = verifyKeyPair(items);

	//Print out the relevant components needed to manually verify test.
	test.message.push("Message: " + items.message);
	test.message.push("Public Key: " + items.publicKey);
	test.message.push("Signature: " + items.signed);

	//callback
	callback(test);
}

function test_autofill(test, items, callback) {
	var pubKeyFeild = document.getElementById('public_key').value;
	var pubKeyFeild2 = document.getElementById('public_key2').value;
	var firstName = document.getElementById('first_name').value;

	if (
			pubKeyFeild === items.publicKey &&
			firstName === "" &&
			pubKeyFeild2 === ""
			) {

		test.passed = true;
	}

	test.message.push("public_key fill value: " + pubKeyFeild);
	test.message.push("public_key 2 fill value: " + pubKeyFeild2);
	test.message.push("Control feild: " + firstName);


	callback(test);
}

function test_autologin(test, items, callback) {
	//TODO
	callback(test);
}

function test_saving(test, items, callback) {
	//TODO
	callback(test);
}

function test_restore(test, items, callback) {
	//TODO
	callback(test);
}
