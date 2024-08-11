import {connect, createDataItemSigner} from "@permaweb/aoconnect";
import fs from "node:fs";
import {backOff} from "exponential-backoff";

const {dryrun} = connect();

const WALLET = JSON.parse(fs.readFileSync("../warp-internal/wallet/arweave/oracle_mu_su_cu/jwk.json", "utf-8"));

const processId = fs.readFileSync('./redstone-oracle-process/subscribable/processId.txt','utf-8')

console.log('Calling', processId);

async function doSpawn() {
  const signer = createDataItemSigner(WALLET);

  const result = await dryrun({
    process: processId,
    data: '',
    tags: [{name: 'Action', value: 'v1.Info'}]
  })

  console.dir(result, {depth: null});

  return result;
}

doSpawn()
  .catch(console.error);