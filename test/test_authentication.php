<!DOCTYPE html>
<html>

	<?php
//http://localhost/dev/cypherpass/test/test_authentication.php

	print("<br>");
	print("Signature: " . $_POST['signature']);
	print("<br>");

	if (!empty($_POST['signature'])) {
		$signature = explode(":", $_POST['signature']);

		if (count($signature) !== 2) {
			die("Invalid signature");
		} else {
			$publicKey = $signature[1];
			$signature = $signature[0];
		}
	}


	print("<br>");


	$token = bin2hex(openssl_random_pseudo_bytes(16));
	print($token);
	?>


	<form action="test_authentication.php" method="post"
		  name="public_key_login" signature_challenge="<?php print($token); ?>">
		<input type="text" name="signature"><br>
	</form>
</html>

