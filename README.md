# AO RedStone Oracle

## High level overview

![img.png](docs/overview.png)

1. The AO Builders **Relayer** is loading a subset of prices offered
   by [RedStone Primary Data Service](https://app.redstone.finance/#/app/data-services/redstone-primary-prod).  
   Currently, offered prices (in relation to USD) are:  
   "BTC", "ETH", "USDC", "USDT", "SOL", "stETH", "AR"
2. The **Relayer** sends the RedStone data to the **[Verifier Process](https://www.ao.link/#/entity/_b21c1djDesKI5LPXBZvZbXKdkTgQIx2FsN2HXtFsqQ)** ([code](https://github.com/warp-contracts/ao-redstone-oracle/blob/main/redstone-oracle-process/warp/oracle.process.mjs)).
3. The **Oracle Verifier Process** [verifies](https://github.com/warp-contracts/ao-redstone-oracle/blob/main/redstone-oracle-process/warp/oracle.process.mjs#L76)
   the prices signatures and timestamps using the official RedStone
   protocol [package](https://github.com/redstone-finance/redstone-oracles-monorepo/tree/main/packages/protocol).
   This package is attached to the Process code via Warp
   QuickJs [plugin](https://github.com/warp-contracts/warp-contracts-plugins/blob/main/warp-contracts-plugin-quickjs/src/eval/QuickJsEvaluator.ts#L54).
4. If the prices are properly verified - i.e.
    - They are signed by a set of trusted RedStone nodes
    - Their timestamp is not too old in relation to the message timestamp

   they are sent to the **[Storage Process](https://www.ao.link/#/entity/fev8nSrdplynxom78XaQ65jSo7-88RxVVVPwHG8ffZk)** ([code](https://github.com/warp-contracts/ao-redstone-oracle/blob/main/redstone-oracle-process/process.lua)).
5. The **Oracle Storage Process** can be used by other Processes in the AO Testnet to load prices ([example](https://www.ao.link/#/message/3vAiYAq1x73sgsLUNgn-EcgW9GmdZkII-tB9Ho0hGww)).

## Ask for price from the **Oracle Storage Process**

If you want to ask for a price from your process - send a message to the **Oracle Storage Process** with
`Action = 'Request-Latest-Data'` and `Tickers = ['AR', 'ETH', ...]`

### Example:

```lua
ao.send({
    Target = 'fev8nSrdplynxom78XaQ65jSo7-88RxVVVPwHG8ffZk', -- the Oracle Storage Process id
    ReqId = msg.Id,
    Action = "Request-Latest-Data",
    Tickers = json.encode({ "AR", "BTC" }) -- required prices
})
```

In response, the **Oracle Storage Process** [sends](https://github.com/warp-contracts/ao-redstone-oracle/blob/main/redstone-oracle-process/process.lua#L37) `Action = "Receive-RedStone-Prices"` with all the requested prices
in the `Data`. Example `Data` (please note that it is a stringified JSON!) in the message:

```
"Data": {
   "AR": {
      "a": "0x51Ce04Be4b3E32572C4Ec9135221d0691Ba7d202", // the address of the RedStone node which provided the price
      "v": 27.346234546008, // the price value
      "t": 1719774710000 // the timestamp of the price
   }
}
```

Example asking contract is [here](https://github.com/warp-contracts/ao-redstone-oracle/blob/main/redstone-oracle-process/example-asking-process/process.lua).

### Full example [flow](https://www.ao.link/#/message/3TlpEO5bG8--ojAkTqXLcfG8oGIju8jWzZ8du2wTH04):
1. User sends a [transaction](https://www.ao.link/#/message/xaGRy5hOE81beCEe2pSGxHnWRlM74eXpTpUSvyXogvY) with action `Check-Prices` to the [example](https://www.ao.link/#/entity/mwhpR_CYe1JFTPYjOdbxKHphZUE0fMFenWY9Jo1kJKY) process.
2. The example process in response sends a [request](https://www.ao.link/#/message/1otLBxetWO14dOASrBxeS0FfjbQiXUvnKZdGRAc6Bd0) for prices to the Oracle process (action `Request-Latest-Data`).
3. The Oracle process [responds](https://www.ao.link/#/message/3TlpEO5bG8--ojAkTqXLcfG8oGIju8jWzZ8du2wTH04) to the example contract with the latest requested prices sent in the `Data` field of the message (action `Receive-RedStone-Prices`)

### Process Ids

1. AO Testnet Oracle Storage Process - https://www.ao.link/#/entity/fev8nSrdplynxom78XaQ65jSo7-88RxVVVPwHG8ffZk
    1. Process `fev8nSrdplynxom78XaQ65jSo7-88RxVVVPwHG8ffZk`
    2. Module `PuJq3dcddz-JZBaYAP3tpEdogFdiyh8HO5tUSGol2N0`
2. AO Warp Testnet Verifier Process - https://www.ao.link/#/entity/_b21c1djDesKI5LPXBZvZbXKdkTgQIx2FsN2HXtFsqQ
    1. Process `_b21c1djDesKI5LPXBZvZbXKdkTgQIx2FsN2HXtFsqQ`
    2. Module `zzL7EbHzpamWfy7gfCRkblTv9gUEbVY1mZvX39B7ihc`
3. AO Testnet Example asking process - https://www.ao.link/#/entity/mwhpR_CYe1JFTPYjOdbxKHphZUE0fMFenWY9Jo1kJKY
    1. Process `mwhpR_CYe1JFTPYjOdbxKHphZUE0fMFenWY9Jo1kJKY`
    2. Module `pNwWAYW5cVPiOv1vJpxParYc0YxkuQRyV5w3oEQ6nnU`

