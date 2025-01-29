import 'dotenv/config';
import {connect, createDataItemSigner} from "@permaweb/aoconnect";
import fs from "node:fs";
import {backOff} from "exponential-backoff";

const AOS_MODULE_2_0_2_NO_SQLITE = "Do_Uc2Sju_ffp6Ev0AnLVdPtot15rvMjP-a9VVaA5fM";
const AO_TESTNET_SU = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";

console.info(`Spawning AOS Lua process`);

const {spawn, message} = connect();

const WALLET = JSON.parse(process.env.JWK);
const CODE = fs.readFileSync("./process/storage-process.lua", "utf-8");

async function doSpawn() {
  const signer = createDataItemSigner(WALLET);

  const processId = await spawn({
    module: AOS_MODULE_2_0_2_NO_SQLITE,
    scheduler: AO_TESTNET_SU,
    signer,
    tags: [
      {name: 'Authority', value: 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY'},
    ],
    data: '1984'
  });

  try {
    const r = await backOff(() => message({
      process: processId,
      data: CODE,
      tags: [{name: 'Action', value: 'Eval'}],
      signer
    }));
    console.log(`Successfully sent 'eval' action for process '${processId}'.`);
    console.log(`https://www.ao.link/#/entity/${processId}`);

    fs.writeFileSync('./process/aos_processId.txt', processId, 'utf-8');
  } catch (e) {
    console.error(e);
  }

  return processId;
}

doSpawn()
  .then(console.log)
  .catch(console.error);
