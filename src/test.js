runTests();


function runTests() {

	//each element sould be a test.
	var tests = {};
	var items = {};



	add_test_report({
		"name": "Test function.",
		"passed": true,
		"message": "Test messsages go here."
	});

	get_saved(function (items) {
		test_get_saved(add_test_report);
		test_signing(items, add_test_report);
		test_saving(add_test_report);
	});


}

//Add the test report to the test page.
function add_test_report(test) {

	if (typeof test === "undefined") {
		throw "Undefined test objected.";
	}

	var div = document.createElement("div");

	if (test.name !== "undefined") {
		var title = document.createElement("h1")
		title.appendChild(document.createTextNode(test.name));
		div.appendChild(title);
	}

	if (test.message !== "undefined") {
		var message = document.createElement("pre");
		if (typeof test.message === "object") {
			message.appendChild(document.createTextNode(JSON.stringify(test.message, null, 4)));
		} else {
			message.appendChild(document.createTextNode(test.message));
		}


		div.appendChild(message);
	}

	if (test.passed !== true) {
		div.setAttribute("class", "failed")
	} else {
		div.setAttribute("class", "passed")
	}
	document.getElementById("testResults").appendChild(div);
}

function new_test(name) {
	return {
		"name": name,
		"passed": false,
		"message": ''
	};
}



/////////////////
//tests
/////////////////
function test_get_saved(callback) {
	var test = new_test("Saved variables");

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

		callback(test);
	});
}

function test_signing(items, callback) {
	var test = new_test("Valid signature");
	verifyKeyPair(items);
	callback(test);
}

function test_saving(callback) {
	var test = new_test("Saving variables");
	callback(test);
}
