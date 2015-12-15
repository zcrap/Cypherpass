runTests();


function runTests() {

	var items = {};


	add_test_report({
		"name": "Test function.",
		"passed": true,
		"message": "Test messsages go here."
	});

	get_saved(function (items) {
		test_get_saved(new_test("Saved variables"), null, add_test_report);
		test_signing(new_test("Valid signature"), items, add_test_report);
		test_saving(new_test("Saving variables"), items, add_test_report);
	});


}

//Add the test report to the test page.
function add_test_report(test) {

	if (typeof test === "undefined") {
		throw "Undefined test objected.";
	}

	var div = document.createElement("div");

	if (test.name !== "undefined") {
		var title = document.createElement("h1");
		title.appendChild(document.createTextNode(test.name));
		div.appendChild(title);
	}

	if (test.message === "undefined") {
		throw "Test message is undefined.  Invalid test.";
	}

	//Message to pring out on body of test report.
	var message;

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

	if (test.passed !== true) {
		div.setAttribute("class", "failed");
	} else {
		div.setAttribute("class", "passed");
	}
	document.getElementById("testResults").appendChild(div);
}


//Return a new test object
function new_test(name) {
	return {
		"name": name,
		"passed": false,
		"message": ''
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
				items.autofill &&
				items.autologin &&
				items.publicKey &&
				items.privateKey
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
	test.message = [];
	test.message.push("Message: " + items.message);
	test.message.push("Public Key: " + items.publicKey);
	test.message.push("Signature: " + items.signed);
	test.message.push("Passed :" + test.passed);

	//callback
	callback(test);
}

function test_saving(test, items, callback) {
	callback(test);
}
