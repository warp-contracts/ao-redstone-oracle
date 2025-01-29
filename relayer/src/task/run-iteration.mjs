import {aggregateValues, checkAndGetSameTimestamp, requestDataPackages} from "@redstone-finance/sdk";
import {convertDataPointToNumericDataPoint} from "@redstone-finance/protocol";
import {message} from "@permaweb/aoconnect";
import {backOff} from "exponential-backoff";

const TRUSTED_REDSTONE_NODES = [
  "0x8BB8F32Df04c8b654987DAaeD53D6B6091e3B774",
  "0xdEB22f54738d54976C4c0fe5ce6d408E40d88499",
  "0x51Ce04Be4b3E32572C4Ec9135221d0691Ba7d202",
  "0xDD682daEC5A90dD295d14DA4b0bec9281017b5bE",
  "0x9c5AE89C4Af6aA32cE58588DBaF90d18a855B6de"
];

export async function runIteration(logger, config) {
  const payload = await generatePayload(logger, config);
  const msgId = await backOff(() => message({
    process: config.aoProcessId,
    data: JSON.stringify(payload),
    tags: [
      {name: 'Action', value: config.aoActionName}
    ],
    signer: config.signer
  }));

  logger.info('Stored message id', msgId)
}

async function generatePayload(logger, config) {
  const uniqueSignersCount = config.uniqueSignersCount;
  const maxTsDiffMs = config.maxTsDiffMs
  const now = new Date();

  const allDataPackages = await requestDataPackages({
    dataServiceId: "redstone-primary-prod",
    dataPackagesIds: config.dataPackagesIds,
    uniqueSignersCount,
    authorizedSigners: TRUSTED_REDSTONE_NODES,
    ignoreMissingFeed: true,
  });

  const result = {};

  for (const dataPackageId in allDataPackages) {
    const dataPackages = allDataPackages[dataPackageId];
    const timestampMs = checkAndGetSameTimestamp(dataPackages);

    if (timestampMs > now + maxTsDiffMs) {
      throw new Error(`Data package from the future? ${timestampMs}, now: ${now}`)
    }
    if (timestampMs < now - maxTsDiffMs) {
      throw new Error(`Data too old. ${timestampMs}, now: ${now}`)
    }

    result[dataPackageId] = {
      verifiedPackage: {
        v: computeMedian(dataPackages),
        t: timestampMs
      }
    };
  }

  return result;
}

function computeMedian(dataPackages) {
  const dataPoints = dataPackages
    .map((dp) => dp.dataPackage.dataPoints[0])
  const values = dataPoints.map(
    (point) => convertDataPointToNumericDataPoint(point).toObj().value
  );
  return aggregateValues(values, "median");
}
