import {AsyncTask, SimpleIntervalJob, ToadScheduler} from "toad-scheduler";
import {RedstoneCommon} from "@redstone-finance/utils";
import {runIteration} from "./run-iteration.mjs";

export class AsyncTaskRunner {
  static run(relayerConfig, logger) {
    const task = new AsyncTask(
      "Relayer task",
      async () => {
        return await RedstoneCommon.timeout(
          runIteration(logger, relayerConfig),
          relayerConfig.iterationTimeoutMs,
          `Updating prices didn't succeed in ${relayerConfig.iterationTimeoutMs} [ms].`
        );
      },
      (error) =>
        logger.log(
          "Unhandled error occurred during iteration:",
          RedstoneCommon.stringifyError(error)
        )
    );

    const job = new SimpleIntervalJob(
      {
        milliseconds: relayerConfig.iterationIntervalMs,
        runImmediately: true,
      },
      task,
      { preventOverrun: true }
    );

    const scheduler = new ToadScheduler();
    scheduler.addSimpleIntervalJob(job);
  }
}
