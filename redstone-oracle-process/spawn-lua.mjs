import {connect, createDataItemSigner} from "@permaweb/aoconnect";
import fs from "node:fs";

const ORACLE_MODULE_ID = "FrdUPdwGEKtRO9NURUU5MpESzk2hz8kHg4zKMYH_rO4";

console.info(`Spawning Lua process`);

const {spawn} = connect();

const WALLET = JSON.parse(fs.readFileSync("./.secrets/wallet.json", "utf-8"));

async function doSpawn() {
  const processId = await spawn({
    module: ORACLE_MODULE_ID,
    scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
    signer: createDataItemSigner(WALLET),
    tags: [],
    data: '1984'
  });
  return processId;
}

doSpawn()
  .then(console.log)
  .catch(console.error);