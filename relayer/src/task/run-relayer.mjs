import 'dotenv/config';
import {loggerFactory} from "@redstone-finance/utils";
import {createDataItemSigner} from "@permaweb/aoconnect";
import {AsyncTaskRunner} from "./AsyncTaskRunner.mjs";

export const runRelayer = () => {
  const relayerConfig = {
    uniqueSignersCount: 3, // hardcoded to prevent misusage
    maxTsDiffMs: 120 * 1000, // hardcoded to prevent misusage
    dataPackagesIds: JSON.parse(process.env.DATA_PACKAGE_IDS),
    iterationIntervalMs: parseInt(process.env.ITERATION_INTERVAL_S) * 1000,
    iterationTimeoutMs: parseInt(process.env.ITERATION_TIMEOUT_S) * 1000,
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
