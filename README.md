![Cypherpass](/plugin/img/cypher_128.png)

# Cypherpass #
#### Public Key Authenticator ####

Let's kill passwords.

Cypherpass is a public key authentication application and aims secure online interactions through the use of public-key cryptography.  Cypherpass's believes passwords are inherently insecure and that public-key cryptography is the final solution for authentication.

Cypherpass's Chrome browser extension can be found in the [Chrome Web Store](https://chrome.google.com/webstore/detail/cypherpass/mafcgnpkgiapmmbjcfffhognhcedfpng) and is publicly available for free download.



### What Cypherpass **IS NOT**
 * Completely secure.
 * Better than TLS, OpenSSL, or other $secure_solution

### What Cypherpass **IS**
 * Sometimes better than security unconcerned users reusing passwords
   and blinding trusting websites with password security.

### How does Cypherpass work?
* Cypherpass initially generates a public/private keypair and saves it to
  Google's cloud storage syncing all instances.
* Cypherpass autofills form inputs either with a name `public_key` or an attribute `data-public_key`.  This input can be visible or hidden.
* Supporting websites associate a user's public key with their login, just like a password.
* When authenticating a website provides a random token.
* Cypherpass cryptographically signs the token.
* The website verifies the cryptographic signature thereby authenticating the user.

### How does autologin work?
* Cypherpass looks for a form named `public_key_auth`
* Form should have an attribute named `data-public_key_challenge` with a randomly generated value.
  * For example:  "a319237c42162360a711f6a3ef790625"
* Cypherpass signs the challenge and inserts the public
  key `public_key`, challenge `challenge`, and signature `signed` as json into the form input named `signature`.
* Cypherpass submits the form for login.

Here's an example valid input:
```json
{
  "public_key": "047eb9a9cd3722a4977320da2f733343c4c585376cf3f39fa7fa029eb6a9f750e39982f16cca04a3674ba8a2867d6fa6198826efb08663f6fd987770d814dab137",
  "challenge": "671aca6abec1ba30f09cb973e350ac4c",
  "signed": "3045022100f8b581a0caba35f9008670ce751342c59c0c8a3dfec129e6b078a270f2c54ef602206e1e7105b3b9aa84bab6dd3661c7fe69fe208b3a356ffe1c05e96a8eebd4e809"
}
```

## How do Key Ledgers work?
So that users can use many keys across many devices, supporting websites can use a key ledger to lookup public keys, instead of storing keys at each individual website.
* If the `public_key` input has an attribute of `data-public_key_ledger` set to `true`, Cypherpass will also provide a uri for a key ledger.
* When authenticating, the website should look at the key ledger an verify that the key is active.

## Advantages of using a key ledger
* Each device can have their own set of keys.
* No need to update website with keys.
* Users can revoke keys they suspect are compromised.
* Key ledgers can store many keys for the user.

### Hopes
 * Easy to implement server side
 * Automatic identification and authentication
 * Using email account retrieval with Cypherpass, a website could do away with
   passwords entirely.

### Features/Behavior
* Autofill forms with a type, "public_key"
* Cypherpass will not autologin if the page is asking for public key.

### Known Issues And Concerns
* Chrome's storage area isn't encrypted meaning sensitive information, namely
private keys, is stored in plaintext.

### //TODO
* Migrate messaging to json
* In browser extension unit testing.
* Support key ledger autofill
* Support many key ledgers.
* Support key ledger signing.
* Support multiple crypto suites.
* Rate limit auto login, allow user to configure this in options page.
* Test server.
* Option to autofill/login on https only.

### Wishlist
* Third party signature server
  * Signature server verifies clients via authorized keys.
* Option: New keypair for each login.
  * Workaround from chrome storage constraint using third party services.
* Multiple logins.
* Support for client side certificates.
* Support for SSH keys
* Firefox support.
* Internalization.
* Mobile.
* Option: Encrypt stored variables.
  * Javascript to encrypt, unencrypt.

Cypherpass proudly uses the jsrsasign library from
https://github.com/kjur/jsrsasign
