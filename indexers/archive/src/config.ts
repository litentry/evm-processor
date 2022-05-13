import { web3 } from "indexer-utils";
import { Config } from "./types";

const config: Config = {
  port: parseInt(process.env.PORT || "4050"),
  web3,
  mongoUri: process.env.MONGO_URI,
  start: parseInt(process.env.START_BLOCK || "0"),
  end: parseInt(process.env.END_BLOCK || "-1") > -1
    ? parseInt(process.env.END_BLOCK)
    : web3.eth.getBlockNumber,
  batchSize: parseInt(process.env.BATCH_SIZE || "20"),
  sqsConfig: {
    queueUrl: process.env.QUEUE_URL || "",
  }
};

export default config;
