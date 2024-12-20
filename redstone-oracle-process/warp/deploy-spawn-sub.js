import { Tag, WarpFactory } from 'warp-contracts';
import { ArweaveSigner, DeployPlugin } from 'warp-contracts-plugin-deploy';
import { createData } from 'warp-arbundles';
import { readFileSync } from 'fs';
import fs from "node:fs";

const jwk = JSON.parse(readFileSync('./.secrets/ao-wallet.json', 'utf-8'));
const signer = new ArweaveSigner(jwk);
const warp = WarpFactory.forMainnet().use(new DeployPlugin());

const envIdx = process.argv.indexOf('--env');
if (envIdx < 0) {
  throw new Error("Specify 'env' flash with either 'local' or 'prod' value");
}
const env = process.argv[envIdx + 1];

console.info(`Deploying for ${env} env.`);

async function deploy() {
  console.log(`Deploying`);
  const module = readFileSync(`./redstone-oracle-process/warp/oracle.process.mjs`, 'utf-8');
  const moduleTags = [
    new Tag('Data-Protocol', 'ao'),
    new Tag('Variant', 'ao.TN.1'),
    new Tag('Type', 'Module'),
    new Tag('Module-Format', 'wasm32-unknown-emscripten'),
    new Tag('Input-Encoding', 'JSON-1'),
    new Tag('Output-Encoding', 'JSON-1'),
    new Tag('Memory-Limit', '500-mb'),
    new Tag('Compute-Limit', '9000000000000'),
    new Tag('Salt', '' + Date.now()),
  ];
  const srcTx = await warp.createSource({ src: module, tags: moduleTags }, signer);
  const srcTxId = await warp.saveSource(srcTx);
  return srcTxId;
}

async function spawn({ moduleId }) {
  console.log(`Spawning ${moduleId}`);
  const processTags = [
    new Tag('Data-Protocol', 'ao'),
    new Tag('Variant', 'ao.TN.1'),
    new Tag('Type', 'Process'),
    new Tag('Module', moduleId),
    new Tag('Scheduler', 'jnioZFibZSCcV8o-HkBXYPYEYNib4tqfexP0kCBXX_M'),
    new Tag('SDK', 'ao'),
    new Tag('Content-Type', 'text/plain'),
    new Tag('Application', 'RedStone-Oracle-Verifier'),
  ];

  const processDataItem = createData("{}", signer, { tags: processTags });
  await processDataItem.sign(signer);

  const muUrl = env === 'local' ? 'http://localhost:8080' : 'https://mu-asia.warp.cc';

  const processResponse = await fetch(muUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      Accept: 'application/json',
    },
    body: processDataItem.getRaw(),
  }).then((res) => res.json());

  return processResponse.id;
}

async function doIt() {
  const moduleId = await deploy();
  const processId = await spawn({ moduleId });

  fs.writeFileSync(`./redstone-oracle-process/warp/processId_sub_${env}.txt`, processId, 'utf-8');

  return {
    moduleId,
    processId
  };
}

doIt().then((r) => {
  console.log(r);
});
