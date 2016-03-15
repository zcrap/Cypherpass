var cyphernode = {
	//generate new key pair and save the settigns.
	generate_transaction_json: function (items, callback) {
		console.log("starting generate_transaction_json");
		//if items is empty, initialize
		if (!items) {
			items = {};
		}


		var transactionVars = ["input", "output", "transaction_hashed", "signature"];
		//initialiaze empty values
//		for each (var t in transactionVars) {
//			if (typeof items.t === 'undefined') {
//				items.t = "";
//			}
//		}

		//design the transaction object.
		var trans = {
			"transaction": {
				"input": items.input,
				"output": items.output
			},
			"transaction_hashed": items.transaction_hashed,
			"signature": items.signed
		};

		//Convert json object into string.
		var jTransaction = JSON.stringify(trans);
		//callback or return
		if (typeof callback === 'function') {
			return callback(jTransaction);
		} else {
			return jTransaction;
		}
	},
	transaction_hashable_json: function (items, callback) {
		var transaction = "{" + "input:" + items.input + ",output:" + items.output + "}";


		if (typeof callback === 'function') {
			return callback(transaction);
		} else {
			return transaction;
		}

	}

};