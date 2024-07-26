import {connect, createDataItemSigner} from "@permaweb/aoconnect";
import fs from "node:fs";
import {requestDataPackages} from "@redstone-finance/sdk";

const envIdx = process.argv.indexOf('--env');
if (envIdx < 0) {
  throw new Error("Specify 'env' flash with either 'local' or 'prod' value");
}
const env = process.argv[envIdx + 1];

console.log(`Running in ${env} environment`);

const DATA_FEEDS = ["BTC", "ETH", "USDC", "USDT", "SOL", "stETH", "AR"];
const DATA_SERVICE_ID = "redstone-primary-prod";
const PROCESS = env === 'local'
  ? '5wL4f2Pi9dAEGOjanCoLFlxL0w3M3jI9AJcvRu89A_0'
  : '_b21c1djDesKI5LPXBZvZbXKdkTgQIx2FsN2HXtFsqQ';

const WALLET = JSON.parse(fs.readFileSync("./.secrets/wallet.json", "utf-8"));
const MU_URL = env === 'local' ? 'http://localhost:8080' : 'https://mu.warp.cc';
const CU_URL = env === 'local' ? 'http://localhost:8090' : 'https://cu.warp.cc';

const { message } = connect({
  MU_URL,
  CU_URL
});

async function getPricePackage() {
  const reqParams = {
    dataServiceId: DATA_SERVICE_ID,
    dataFeeds: DATA_FEEDS,
    uniqueSignersCount: 1,
  }
  const dataPackagesResponse = await requestDataPackages(reqParams);

  return dataPackagesResponse;
}

async function postPricePackages() {
  const prices = await getPricePackage();
  const msgId = await message({
    process: PROCESS,
    signer: createDataItemSigner(WALLET),
    data: JSON.stringify(prices),
    tags: [
      {name: 'Action', value: 'Store-Price-Packages'},
      {name: 'Sent-Timestamp', value: '' + Date.now() },
    ],
  });

  return msgId;
}

postPricePackages()
  .then(console.log)
  .catch(console.error);