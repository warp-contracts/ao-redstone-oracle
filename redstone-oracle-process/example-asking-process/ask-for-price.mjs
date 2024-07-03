import {createDataItemSigner, message, result} from "@permaweb/aoconnect";
import fs from "node:fs";

console.info(`Asking for a price`);


const WALLET = JSON.parse(fs.readFileSync("./.secrets/wallet.json", "utf-8"));

const process = "mwhpR_CYe1JFTPYjOdbxKHphZUE0fMFenWY9Jo1kJKY";

async function ask() {
  const msgId = await message({
    process,
    signer: createDataItemSigner(WALLET),
    tags: [
      {name: "Oracle-Process", value: "fev8nSrdplynxom78XaQ65jSo7-88RxVVVPwHG8ffZk" },
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