const TRUSTED_ARWEAVE_ADDRESS = "f70fYdp_r-oJ_EApckTYQ6d66KaEScQLGTllu98QgXg";

const TRUSTED_REDSTONE_NODES = [
  "0x8BB8F32Df04c8b654987DAaeD53D6B6091e3B774",
  "0xdEB22f54738d54976C4c0fe5ce6d408E40d88499",
  "0x51Ce04Be4b3E32572C4Ec9135221d0691Ba7d202",
  "0xDD682daEC5A90dD295d14DA4b0bec9281017b5bE",
  "0x9c5AE89C4Af6aA32cE58588DBaF90d18a855B6de"
];

// note: sometimes the diff is bigger than 10s - eg:
// Fri Jun 28 2024 20:11:30 GMT+0200 (czas środkowoeuropejski letni) - price package
// vs
// Fri Jun 28 2024 20:11:42 GMT+0200 (czas środkowoeuropejski letni) - msg.Timestamp
const MAX_TS_DIFF_MS = 15_000;
const MAX_LAST_UPDATES = 50;

const AO_TESTNET_STORAGE_PROCESS = null;

function handle(state, message) {
  if (state.config === undefined) {
    console.log('state init');
    state.updateCounter = 0;
    state.lastUpdates = [];
    state.config = {
      aoProcess: AO_TESTNET_STORAGE_PROCESS,
      maxLastUpdates: MAX_LAST_UPDATES,
      maxTsDiffMs: MAX_TS_DIFF_MS,
      trustedWallets: [TRUSTED_ARWEAVE_ADDRESS],
      trustedRedStoneNodes: TRUSTED_REDSTONE_NODES
    }
  }
  console.log('checking owner');

  if (!state.config.trustedWallets.includes(message.Owner)) {
    throw new ProcessError(`Only ${JSON.stringify(state.config.trustedWallets)} allowed to interact with this process`);
  }

  const action = message.Tags.find((t) => t.name === 'Action').value;
  if (!action) {
    throw new ProcessError('Process action not defined');
  }

  switch (action) {
    case 'Info': {
      ao.result({
        updates: state.updateCounter,
        ...state.config,
      });
      break;
    }

    case 'Update-Config': {
      const newConfig = JSON.parse(message.Data);
      state.config = {
        ...state.config,
        ...newConfig
      }
      ao.result(state.config);
      break;
    }

    case 'Store-Price-Packages':
      if (state.config.aoProcess === null) {
        throw new ProcessError(`AO Process is not set`);
      }
      const dataPackage = JSON.parse(message.Data);
      const sentTs = message.Tags.find((t) => t.name === 'Sent-Timestamp').value;

      const result = {
        sentTs: parseInt(sentTs)
      };
      const msgTs = message.Timestamp;

      for (const ticker in dataPackage) {
        console.log('Checking ticker', ticker);
        if (!dataPackage.hasOwnProperty(ticker)) {
          continue;
        }
        try {
          const redStoneData = JSON.parse(RedStone.recoverSignerAddress(dataPackage[ticker][0]));
          if (!state.config.trustedRedStoneNodes.includes(redStoneData.a)) {
            throw new ProcessError(`Data package for ${ticker} comes from a non-trusted signer ${redStoneData.a}`);
          }

          if (redStoneData.t < (msgTs - state.config.maxTsDiffMs)) {
            throw new ProcessError(`Data package too old - packageTs: ${redStoneData.t}, msgTs: ${msgTs}`);
          }
          if (redStoneData.t > (msgTs + state.config.maxTsDiffMs)) {
            throw new ProcessError(`Data package from the future? - packageTs: ${redStoneData.t}, msgTs: ${msgTs}`);
          }
          if (state.lastUpdates.length) {
            const latestUpdate = state.lastUpdates[state.lastUpdates.length - 1];
            if (redStoneData.t <= latestUpdate[ticker].verifiedPackage.t) {
              throw new ProcessError(`New package has ts <= latest package`);
            }
          }

          result[ticker] = {
            /*rawPackage: JSON.parse(dataPackage[ticker][0]),*/
            verifiedPackage: redStoneData
          };
        } catch (e) {
          throw new ProcessError(`Could not parse price package ${e.message}`);
        }
      }
      state.updateCounter++;
      state.lastUpdates.push(result);
      if (state.lastUpdates.length > state.config.maxLastUpdates) {
        state.lastUpdates.shift();
      }

      ao.result(`Prices stored for ${message.Id}`);

      const payload = {
        Action: "Store-Prices",
        Data: JSON.stringify(result),
      }

      ao.send({
        ...payload,
        Target: state.config.aoProcess,
      });

      break;
    default:
      throw new ProcessError(`Unknown action: ${action.cmd}`);
  }
}
