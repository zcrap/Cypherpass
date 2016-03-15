<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>

<!DOCTYPE html>
<html>
	<p>
		<?php
		//http://localhost/dev/cypherpass/test/test_authentication.php


		if (!empty($_POST['signature'])) {
			print("Last input: " . $_POST['signature'] . "<br />");
			$json = json_decode($_POST['signature']);
			//$signature = explode("|", $_POST['signature']);
			//var_dump($json);
			$signature = $json->signed;
			//print("Signature:" . $signature);
		}


		print("<br>");


		$token = bin2hex(openssl_random_pseudo_bytes(16));
		print($token);
		?>
	</p>


	<form action="test_authentication.php" method="post"
		  name="public_key_auth" data-public_key_challenge="<?php print($token); ?>">
		<input type="text" name="signature"><br>
	</form>
</html>

