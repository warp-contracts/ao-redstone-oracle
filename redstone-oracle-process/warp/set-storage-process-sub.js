import {ArweaveSigner} from 'warp-contracts-plugin-deploy';
import {readFileSync} from 'fs';
import fs from "node:fs";
import {connect, createDataItemSigner} from "@permaweb/aoconnect";

const jwk = JSON.parse(readFileSync('../warp-internal/wallet/arweave/oracle_mu_su_cu/jwk.json', 'utf-8'));

const envIdx = process.argv.indexOf('--env');
if (envIdx < 0) {
  throw new Error("Specify 'env' flash with either 'local' or 'prod' value");
}
const env = process.argv[envIdx + 1];
const muUrl = env === 'local' ? 'http://localhost:8080' : 'https://mu.warp.cc';

console.info(`Setting storage process for ${env} env.`);

const {message} = connect({
  MU_URL: muUrl
});

async function doIt() {
  const processId = fs.readFileSync(`./redstone-oracle-process/warp/processId_sub_${env}.txt`, 'utf-8');
  const aoProcessId = fs.readFileSync(`./redstone-oracle-process/subscribable/processId.txt`, 'utf-8');

  console.log(processId);
  const id = await message({
    process: processId,
    data: JSON.stringify({aoProcess: aoProcessId}),
    tags: [{name: 'Action', value: 'Update-Config'}],
    signer: createDataItemSigner(jwk)
  });


  return id;
}

doIt().then(console.log);
