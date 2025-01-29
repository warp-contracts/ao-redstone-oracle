# AO prices relayer

This service allows to relay prices loaded from the RedStone Oracles into an AO process.

### Installation

`npm install`

### Spawn storage process

In case you plan to use the default storage process implementation - spawn a new process instance on AO.  
First - modify the trusted wallets in the `process/storage-process.lua` - `ORACLE.relayerWallets` value.

Then spawn the process with:  
`npm run process:spawn`.

The process id will be stored in the `process/aos_processId.txt` file.

### Start the relayer

The relayer requires a machine with at least 1 cpu and 2GB of RAM.

Create the `.env` file (you can take the `.env.example` as a base)
and update required variables:

| Name                 | Description                                                     | Example value                               |
|----------------------|-----------------------------------------------------------------|---------------------------------------------|
| DATA_PACKAGE_IDS     | Any array of data packages ids to store in the AO process       | ["AR", "ETH", "BTC", "USDC"]                |
| ITERATION_INTERVAL_S | How often (in seconds) the prices should be updated             | 30                                          |
| ITERATION_TIMEOUT_S  | Timeout for a single relayer iteration                          | 25                                          |
| JWK                  | The Arweave wallet that will be used to sign messages to AO     | {"kty":"RSA","n":"uCi747FA1s....}           |
| AO_ACTION_NAME       | The Action to be called on the AO Process                       | Store-Prices                                |
| AO_PROCESS_ID        | The storage process id (value from `process/aos_processId.txt`) | eOFEk0_jjRFE3mVqmNcYfLA89vXkVpUSOQHZJ4sqkuk |

Run the relayer with  
`npm run relayer:start`

### Best practices
1. Make sure that the relayer is highly available and has at least one additional - fallback instance.
2. Make sure to properly monitor whether the prices are updated on the storage process.
To do so - you can `dryRun` with `v1.Info` action, which returns a response similar to:
```json
{
  "Messages": [
    {
      "Tags": [
        {
          "name": "Data-Protocol",
          "value": "ao"
        },
        {
          "name": "Variant",
          "value": "ao.TN.1"
        },
        {
          "name": "Type",
          "value": "Message"
        },
        {
          "name": "Reference",
          "value": "1"
        },
        {
          "name": "Version",
          "value": "1.0.0"
        },
        {
          "name": "RelayerWallets",
          "value": [
            "MX9VKOQqWG-uvKd9LOO1Vy3DAcievSU463nTdKDJe9s"
          ]
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "Anchor": "00000000000000000000000000000001",
      "Data": {
        "Prices": [
          {
            "AR": {
              "verifiedPackage": {
                "v": 12.69791982,
                "t": 1738174430000
              }
            }
          },
          {
            "AR": {
              "verifiedPackage": {
                "v": 12.70808406,
                "t": 1738174460000
              }
            }
          }
        ]
      },
      "Target": "1234"
    }
  ]
}
```

The `Data.Prices` field contains the current snapshot of the process' storage . 
You should monitor whether the `t` field (i.e. the price timestamp in ms) of each data package id (e.g. `"AR"`) 
for the last element of the `Data.Prices` array is not "too old".

