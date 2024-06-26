import {requestDataPackages} from "redstone-sdk";
import {createDataItemSigner, message} from "@permaweb/aoconnect";
import fs from "node:fs";

const wallet = JSON.parse(fs.readFileSync("./.secrets/wallet.json", "utf-8"));
const processId = "";

async function getPricePackage() {
  const reqParams = {
    dataServiceId: "redstone-primary-prod",
    dataFeeds: ["BTC", "ETH", "USDC", "USDT", "SOL", "stETH"],
    uniqueSignersCount: 1,
  }
  return requestDataPackages(reqParams);
}

async function postPricePackages() {
  const prices = await getPricePackage();
  try {
    const result = await message({
      process: processId,
      signer: createDataItemSigner(wallet),
      data: JSON.stringify(prices),
      tags: [
        {name: "Data-Service-Id", value: "redstone-primary-prod"},
        {name: "Timestamp-Sent", value: "" + Date.now()}
      ]
    });
    console.log(result);
  } catch (e) {
    console.error(e);
  }
}

postPricePackages()
  .then(console.log)
  .catch(console.error);
