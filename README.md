![Cypherpass](/img/cypher_128.png)

# Cypherpass #
#### Public Key Authenticator ####

Let's kill passwords.

Cypherpass is a proof of concept exercise in using public key cryptography for
authentication through a browser extension and is aimed at lazy users that
aren't too worried about authentication security and desire to bypass passwords.

### What Cypherpass **IS NOT**
 * Completely secure.
 * Better than TLS, OpenSSL, or other $secure_solution

### What Cypherpass **IS**
 * Sometimes better than security unconcerned users reusing passwords
   and blinding trusting websites with password security.

### How does Cypherpass work?
* Cypherpass initially generates a public/private keypair and saves it to
  Google's cloud storage syncing all instances.
* Supporting websites associate a user's public key with their login, just like a password.
* When authenticating a website provides a random token.
* Cypherpass cryptographically signs the token.
* The website verifies the cryptographic signature thereby authenticating the
  user.

### How does autologin work?
* Cypherpass looks for a form named `public_key_login`
* Form should have an attribute named `challenge` with a randomly generated
  value (we suggest something a few bytes long, like
  "a319237c42162360a711f6a3ef790625")
* Cypherpass signs the value and inserts the newly created signature,
  concatenated with the public key delimited by `:`, into the form input
  named `signature`.
* Cypherpass submits the form for login.

### Hopes
 * Easy to implement server side
 * Automatic identification and authentication
 * Using email account retrieval with Cypherpass, a website could do away with
   passwords entirely.

### Features/Behavior
* Autofill forms with a type, "public_key"
* Cypherpass will not autologin if the page is asking for public key.

### Known Issues And Concerns
* Chrome's storage area isn't encrypted meaning sensitive information is
  stored in plaintext.

### //TODO
* In browser extension unit testing.
* Support multiple crypto suites.
* Rate limit auto login, allow user to configure this in options page.
* Test server.

### Wishlist
* Third party signature server
  * Signature server verifies clients via authorized keys.
* Option: New keypair for each login.
  * Workaround from chrome storage constraint using third party services.
* Multiple logins.
* Support for client side certificates.
* Firefox support.
* Internalization.
* Mobile.
* Option: Encrypt stored variables.
  * Javascript to encrypt, unencrypt.

Cypherpass proudly uses the jsrsasign library from
https://github.com/kjur/jsrsasign
