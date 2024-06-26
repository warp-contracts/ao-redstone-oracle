import {connect, createDataItemSigner, message, result} from "@permaweb/aoconnect";
import fs from "node:fs";

console.info(`Asking for a price`);


const WALLET = JSON.parse(fs.readFileSync("./.secrets/wallet.json", "utf-8"));

const process = "KvQhYDJTQwpS3huPUJy5xybUDN3L8SE1mhLOBAt5l6Y";

async function ask() {
  const msgId = await message({
    process,
    signer: createDataItemSigner(WALLET),
    tags: [
      {name: "Tickers", value: JSON.stringify(['AR', 'BTC']) },
      {name: "Action", value: "Request-Latest-Data"}
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
  .then((r) => console.dir(r, {depth: null}))
  .catch(console.error);