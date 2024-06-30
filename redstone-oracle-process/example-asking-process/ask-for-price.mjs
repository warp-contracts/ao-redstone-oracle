import {connect, createDataItemSigner, message, result} from "@permaweb/aoconnect";
import fs from "node:fs";

console.info(`Asking for a price`);


const WALLET = JSON.parse(fs.readFileSync("./.secrets/wallet.json", "utf-8"));

const process = "UhOpP8XPY_qgSY8Lo-0GDYSDNV0KRwzuwddXeEgHZ3s";

async function ask() {
  const msgId = await message({
    process,
    signer: createDataItemSigner(WALLET),
    tags: [
      {name: "Oracle-Process", value: "KvQhYDJTQwpS3huPUJy5xybUDN3L8SE1mhLOBAt5l6Y" },
      {name: "Action", value: "Check-Prices"}
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
  .then(console.log)
  .catch(console.error);