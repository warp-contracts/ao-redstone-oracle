import {connect, createDataItemSigner, message} from "@permaweb/aoconnect";
import fs from "node:fs";

console.info(`Spawning Lua process`);

const {spawn, result} = connect();

const WALLET = JSON.parse(fs.readFileSync("./.secrets/wallet.json", "utf-8"));

const process = "Us4BVLXDjtRz7Qzf7osnNcxTsi4vEjfMWo1RRTzhigQ";

async function ask() {
  const msgId = await message({
    process,
    signer: createDataItemSigner(WALLET),
    tags: [
      {name: "Action", value: "requestLatestData"},
      {name: "Tickers", value: JSON.stringify(['AR', 'BTC'])},
    ],
    data: '1984'
  });
  const msgResult = await result({
    message: msgId,
    process
  });

  return msgResult;
}

ask()
  .then(console.log)
  .catch(console.error);