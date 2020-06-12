import ccxt from "ccxt";
import fs from "fs";
import Ajv from "ajv";
import { createConnection, getConnectionOptions } from 'typeorm';

import Candle from "./entities/candle"
import getConfig from "./config/getConfig";
import { bail } from "./utils/index";


export default async () => {
  try {
    const config = validateConfig();
    const store = await connectStore();
    const exchange = await connectExchange(config);
    return { config, store, exchange };
  } catch (err) {
    console.log("Error in boot phase: ", err);
  }
};

const validateConfig = () => {
  // schema is generated at build-time with typescript-json-schema
  const schemaFile = fs.readFileSync(`${__dirname}/config/config.schema.json`, "utf8");
  const configSchema = JSON.parse(schemaFile);
  const config = getConfig();

  const ajv = new Ajv();
  const validate = ajv.compile(configSchema);
  const valid = validate(config);

  if (valid) {
    console.log("configuration validated");
    return config;
  } else {
    validate.errors.forEach((errObj) => {
      console.log(`error while validating schema: ${errObj.dataPath}: ${errObj.message}`);
    });
    bail("Could not validate configuration file.");
  }
};

const connectExchange = async (config) => {

  try {
    const { exchangeId, apiKey, secret, timeout } = config.exchange;
    const exchange = new ccxt[exchangeId]({
      apiKey,
      secret,
      timeout
    });

    return exchange;

  } catch (err) {
    console.log(err);
  }
};

const connectStore = async () => {
  try {
    // connect to db and return instance
    const dbPath = `${__dirname}/../db/backfill.sqlite`

    if (!fs.existsSync(dbPath)) {
      bail("Could not find database file")
    }
    
    let dbOptions = await getConnectionOptions();

    const store = await createConnection({
      ...dbOptions,
      entities: [ Candle ]
    });
    
    await store.synchronize();

    return store;

  } catch (err) {
    console.log("Error connecting to database: ", err);
  }
};
