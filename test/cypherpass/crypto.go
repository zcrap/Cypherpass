package cypherpass

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"

	"github.com/btcsuite/btcd/btcec"
)

func Test() {
	var (
		sigHex  = "304402205cd69d7989146773abaa95586630f9942b35e11caff280425ce18afe9878c9db022030ced5d604b2e93dc105b294406e2b824d90121ed514cab33b2b8ab3d1eaf281"
		pubHex  = "047eb9a9cd3722a4977320da2f733343c4c585376cf3f39fa7fa029eb6a9f750e39982f16cca04a3674ba8a2867d6fa6198826efb08663f6fd987770d814dab137"
		message = "a"
	)

	_, _ = VerifySigHex(pubHex, message, sigHex)
}

func VerifySigHex(pubHex, message, sigHex string) (bool, error) {
	//Pubkey
	//Decode Hex
	pubConcat, err := hex.DecodeString(pubHex)
	if err != nil {

		return false, errors.New("Invalid hexidecimal string: " + err.Error() + ", string: " + pubHex)
	}
	//Parse
	pubKey, err := btcec.ParsePubKey(pubConcat, btcec.S256())
	if err != nil {
		return false, errors.New("Unable to parse public key: " + err.Error() + ", string: " + string(pubConcat))
	}

	//Hashed
	hashed32 := sha256.Sum256([]byte(message))
	var hashed []byte = hashed32[0:32]

	//Sig
	sigConcat, err := hex.DecodeString(sigHex)
	if err != nil {
		return false, errors.New("Invalid hexidecimal string: " + err.Error() + ", string: " + sigHex)
	}

	//Specify the curve
	curve := elliptic.P256()
	//Parse the signature
	sig, err := btcec.ParseDERSignature(sigConcat, curve)
	if err != nil {
		fmt.Println(err.Error())
	}

	//Pub key, hash, r, s
	ecdsaPubKey := pubKey.ToECDSA()
	verified := ecdsa.Verify(ecdsaPubKey, hashed, sig.R, sig.S)

	//Print Outs
	fmt.Println("Pubkey bytes: ", pubConcat)
	fmt.Println("Pubkey parsed: ", pubKey)
	fmt.Println("Message:", message)
	fmt.Println("Message Hashed:", hashed)
	fmt.Println("SigConcat:", sigConcat)
	fmt.Println("R:", sig.R)
	fmt.Println("S:", sig.S)

	fmt.Println("Verified:", verified)

	return verified, nil
}
