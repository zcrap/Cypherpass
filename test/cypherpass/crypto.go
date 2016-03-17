package cypherpass

import (
	"crypto/ecdsa"
	"crypto/elliptic"

	"crypto/sha256"
	"fmt"

	"math/big"
)

func Hello() {
	fmt.Println("Hello")
}

/*
type PublicKey struct {
	elliptic.Curve
	X, Y *big.Int
}


{
."public_key":"045cf87f895a5e3a2e426400a5439be79d6639a9259908adfc4f8bbee42de46b3a7fa552ed41f8d8461de826c716b5cd19c044e08cb0588e3831cc24910a287867",
"message":"a",
"signed":"3045022100fc1f6440e4d31dca44de581048816f149be33c0033cde98d0b80cf153725ace002200ba2f0e4c1723245d28b85d5b156f1789386541a057f24a42e7f3b7038a4cdb1"
}

*/

func Run() {

	//We are going to get the hex encoded values.
	//Need to convert for this.
	//https://kjur.github.io/jsrsasign/api/symbols/KJUR.crypto.ECDSA.html#.verifyHex

	pubkeyCurve := elliptic.P256()
	h := sha256.New()

	//two points of the sig
	var x, y *big.Int

	var pubkey ecdsa.PublicKey
	pubkey = ecdsa.PublicKey{
		pubkeyCurve,
		x, y,
	}

	// Sign ecdsa style
	r := big.NewInt(0)
	s := big.NewInt(0)

	signature := r.Bytes()
	signature = append(signature, s.Bytes()...)

	fmt.Printf("Signature : %x\n", signature)

	// Verify
	verifystatus := ecdsa.Verify(&pubkey, signhash, r, s)
	fmt.Println(verifystatus) // should be true
}
