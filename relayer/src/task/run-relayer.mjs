import 'dotenv/config'
import {loggerFactory} from "@redstone-finance/utils";
import {createDataItemSigner} from "@permaweb/aoconnect";
import {AsyncTaskRunner} from "./AsyncTaskRunner.js";

export const runRelayer = () => {
  const relayerConfig = {
    uniqueSignersCount: parseInt(process.env.UNIQUE_SIGNERS_COUNT),
    maxTsDiffMs: parseInt(process.env.MAX_TS_DIFF_S) * 1000,
    dataPackagesIds: JSON.parse(process.env.DATA_PACKAGE_IDS),
    relayerIterationIntervalMs: parseInt(process.env.RELAYER_ITERATION_INTERVAL_S) * 1000,
    signer: createDataItemSigner(JSON.parse(process.env.JWK)),
    aoActionName: process.env.AO_ACTION_NAME,
    aoProcessId: process.env.AO_PROCESS_ID,
  }

  const logger = loggerFactory("relayer/run");

  logger.log(
    `Starting contract prices updater with relayer config ${JSON.stringify(
      {
        ...relayerConfig,
        jwk: "********",
      }
    )}`
  );

  AsyncTaskRunner.run(relayerConfig, logger);
};
