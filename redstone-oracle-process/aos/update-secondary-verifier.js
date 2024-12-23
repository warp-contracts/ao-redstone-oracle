import {connect, createDataItemSigner} from "@permaweb/aoconnect";
import fs from "node:fs";

console.info(`Second Verifier process`);

const {message} = connect();
const WALLET = JSON.parse(fs.readFileSync("../warp-internal/wallet/arweave/oracle_mu_su_cu/jwk.json", "utf-8"));
const CODE = fs.readFileSync("./redstone-oracle-process/aos/process_secondary_verifier.lua", "utf-8");

async function doIt() {
  const signer = createDataItemSigner(WALLET);
  const processId = fs.readFileSync('./redstone-oracle-process/aos/aos_processId.txt', 'utf-8');

  const id = await message({
    process: processId,
    data: CODE,
    tags: [{name: 'Action', value: 'Eval'}],
    signer
  });

  return id;
}

doIt()
  .then(console.log)
  .catch(console.error);