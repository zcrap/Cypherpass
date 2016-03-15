#Key Ledger

All communication with key ledgers is via json.

##Getting and Verifying Public Keys
Keys can be verified on the server by issuing a transaction with the input and output equaling the public key in question.

###Requesting key verification.

```json
{
  "transaction": {
    "input": "047eb9a9cd3722a4977320da2f733343c4c585376cf3f39fa7fa029eb6a9f750e39982f16cca04a3674ba8a2867d6fa6198826efb08663f6fd987770d814dab137",
    "output": "047eb9a9cd3722a4977320da2f733343c4c585376cf3f39fa7fa029eb6a9f750e39982f16cca04a3674ba8a2867d6fa6198826efb08663f6fd987770d814dab137"
  },
  "transaction_hashed": "4d3e7958fbc7944269218b172fc616134ac4e1489e368589c6b76628913b9f49",
  "signature": "3045022100ab6fc773bc129b7aeeafaeffa59ed930c8fd2c3bcad3bad514c90dda548fea710220274c4fa8a5a118a2c75d1de8052f540ef80f79c413bb66507ba41f22da9b8314"
}
```
###Ledger Response

```json
{
key_verified:
"047eb9a9cd3722a4977320da2f733343c4c585376cf3f39fa7…74ba8a2867d6fa6198826efb08663f6fd987770d814dab137"
}
```

Or

```{
transaction_confirmed:
"047eb9a9cd3722a4977320da2f733343c4c585376cf3f39fa7…74ba8a2867d6fa6198826efb08663f6fd987770d814dab137"
}
```

##Registering Keys
Key for new devices can be regestered to a key regester via an empty transaction.

```json
{
  "transaction": {
    "input": "047eb9a9cd3722a4977320da2f733343c4c585376cf3f39fa7fa029eb6a9f750e39982f16cca04a3674ba8a2867d6fa6198826efb08663f6fd987770d814dab137",
    "output": "043b5aa96e87b7466a5a3e27678e7e14f995b3551b1522e549961e613ea775272572245334ca8f4f3deccc47f5cfe1d90f0c57b9eba1206a6d772cbf86a7aab235"
  },
  "transaction_hashed": "4d3e7958fbc7944269218b172fc616134ac4e1489e368589c6b76628913b9f49",
  "signature": "3045022100ab6fc773bc129b7aeeafaeffa59ed930c8fd2c3bcad3bad514c90dda548fea710220274c4fa8a5a118a2c75d1de8052f540ef80f79c413bb66507ba41f22da9b8314"
}
```


