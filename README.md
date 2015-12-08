![Cypherpass](/img/cypher_128.png)

# Cypherpass

Let's kill passwords.

Cypherpass is a proof of concept exercise in using public key cryptography for
authentication through a browser extension.

Cypherpass is aimed at lazy users that aren't too worried about authentication
security but still want to easily and quickly authenticate while not revealing
passwords to third parties.

## What Cypherpass **IS NOT**
 - Completely secure.
 - Better than TLS.
 - Better than OpenSSL.
 - Better than $secure_solution

## What Cypherpass **IS**
 - Sometimes better than lazy, security unconcerned users reusing passwords
   and blinding trusting websites with password security.

## How does cypherpass work?
- Cypherpass generates a public/private key pair in the browser and saves it to
  Google's cloud storage syncing all instances.
- Supporting websites must first associate the user's public key with their login.
- When offering authenticating, a website generates a random token.
- Cypherpass signs the token and sends it back with the public key.
- The website verifies the signature thereby authenticating the user.

## How does autologin work?
- Cypherpass looks for a form named `public_key_login`
- Form should have an attribute named `signature_challenge`
  with a randomly generated value (we suggest something a few bytes
  long, like "a319237c42162360a711f6a3ef790625")
- Cypherpass signs the value and inserts the newly created signature, concatenated
  with the public key delimited by `:`, into the form input named `signature`.
- Cypherpass submits the form for login.

### Hopes
 - Easy to implement server side
 - Automatic identification and authentication
 - Using email account retrieval with Cypherpass, a website could do away with
   passwords.

### Features/Behavior
- Autofill forms with a type, "public_key"
- Cypherpass will not autologin if the page is asking for public key.

### //TODO
- Specify crypto/curve.
- Rate limit auto login.
- In browser extension unit testing.
- Manual import of keys.

Cypherpass proudly uses the jsrsasign library from
https://github.com/kjur/jsrsasign
