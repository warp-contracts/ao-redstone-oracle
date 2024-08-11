import {connect, createDataItemSigner} from "@permaweb/aoconnect";
import fs from "node:fs";
import {backOff} from "exponential-backoff";

const AOS_MODULE_2_0_0_RC_1_1_NO_SQLITE = "xT0ogTeagEGuySbKuUoo_NaWeeBv1fZ4MqgDdKVKY0U";
const AOS_MODULE_2_0_0_RC1_SQLITE = "sFNHeYzhHfP9vV9CPpqZMU-4Zzq_qKGKwlwMZozWi2Y";
const AO_TESTNET_SU = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";

console.info(`Spawning AOS Oracle Lua process`);

const {spawn, message} = connect();

const WALLET = JSON.parse(fs.readFileSync("../warp-internal/wallet/arweave/oracle_mu_su_cu/jwk.json", "utf-8"));

const CODE = fs.readFileSync("./redstone-oracle-process/subscribable/build/process.lua", "utf-8");

async function doSpawn() {
  const signer = createDataItemSigner(WALLET);

  const processId = await spawn({
    module: AOS_MODULE_2_0_0_RC_1_1_NO_SQLITE,
    scheduler: AO_TESTNET_SU,
    signer,
    tags: [
      {name: 'Authority', value: 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY'},
      {name: 'Authority', value: 'f70fYdp_r-oJ_EApckTYQ6d66KaEScQLGTllu98QgXg'},
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
    console.log(`https://www.ao.link/#/message/${r}`);

    fs.writeFileSync('./redstone-oracle-process/subscribable/processId.txt', processId, 'utf-8');
  } catch (e) {
    console.error(e);
  }

  return processId;
}

doSpawn()
  .then(console.log)
  .catch(console.error);