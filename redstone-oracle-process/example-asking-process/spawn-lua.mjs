import {connect, createDataItemSigner} from "@permaweb/aoconnect";
import fs from "node:fs";

const MODULE_ID = "2HTIF-P9WHaub_I5ewGk-vx-HMob798i-pZ7OcxxRzU";

console.info(`Spawning Lua process`);

const {spawn} = connect();

const WALLET = JSON.parse(fs.readFileSync("./.secrets/wallet.json", "utf-8"));

async function doSpawn() {
  const processId = await spawn({
    module: MODULE_ID,
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