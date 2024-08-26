import {connect, createDataItemSigner} from "@permaweb/aoconnect";
import fs from "node:fs";

console.info(`Setting Verifier process`);

const {message} = connect();
const WALLET = JSON.parse(fs.readFileSync("../warp-internal/wallet/arweave/oracle_mu_su_cu/jwk.json", "utf-8"));


async function doIt() {
  const signer = createDataItemSigner(WALLET);
  const processId = fs.readFileSync('./redstone-oracle-process/aos/aos_processId.txt', 'utf-8');

  const id = await message({
    process: processId,
    data: `
    local json = require "json"
    function ORACLE.v2.Info(msg)
    assert(#ORACLE.Storage > 0, 'Storage is empty')
    local latestPrices = ORACLE.Storage[#ORACLE.Storage]
    ao.send({
        Target = msg.From,
        Version = ORACLE._version,
        VerifierProcess = ORACLE.verifierProcess,
        Data = json.encode(latestPrices)
    })
end

Handlers.add(
        "ORACLE.v2.Info",
        Handlers.utils.hasMatchingTag("Action", "v2.Info"),
        ORACLE.v2.Info
)
    `,
    tags: [{name: 'Action', value: 'Eval'}],
    signer
  });

  return id;
}

doIt()
  .then(console.log)
  .catch(console.error);