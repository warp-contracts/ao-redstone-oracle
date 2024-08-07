import {connect, createDataItemSigner} from "@permaweb/aoconnect";
import fs from "node:fs";
import {backOff} from "exponential-backoff";

const {message} = connect();

const WALLET = JSON.parse(fs.readFileSync("./.secrets/wallet.json", "utf-8"));


async function doSubscribe() {
  const signer = createDataItemSigner(WALLET);

  try {
    const r = await backOff(() => message({
      process: 'jALi7-3W15a3o11-VHt4cVmvUWMCm2zpMFSvdsU7BTQ',
      data: '1984',
      tags: [
        {name: 'Action', value: 'Register-Whitelisted-Subscriber'},
        {name: 'Subscriber-Process-Id', value: '2mlcqXJZyF0-YyAkGlYQ7OklzrGfs2bxsuUgkNDVXQI'},
        {name: 'Topics', value: '["prices-update"]'},
      ],
      signer
    }));
    console.log(`https://www.ao.link/#/message/${r}`);
    return r;
    // process response
  } catch (e) {
    console.error(e);
  }

}

doSubscribe()
  .then(console.log)
  .catch(console.error);