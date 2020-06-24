import ccxt from "ccxt";
import fs from "fs";
import Ajv from "ajv";
import log from 'fancy-log'
import program from 'commander'
import { MongoClient } from "mongodb"

import getConfig from "./lib/getConfig";
import { bail } from "./utils/index";
import { Config }from "./types/interfaces/config"
import createCli from "./lib/cli"

let userConfig: Config; 

export default async () => {
  try {
    // Register base options and return program (CLI) object
    getUserConfig()
    
    const config = validateConfig();
    const store = await connectStore();
    const exchange = await connectExchange();
    
    const bootData = {
      config,
      store,
      exchange
    }
    createCli(bootData)
    return bootData;

  } catch (err) {
    console.log("Error in boot phase: ", err);
  }
};


const getUserConfig = () => {
  userConfig = getConfig()
}

const validateConfig = () => {
  // schema is generated at build-time with typescript-json-schema
  const schemaFile = fs.readFileSync(`${__dirname}/config/config.schema.json`, "utf8");
  const configSchema = JSON.parse(schemaFile);

  const ajv = new Ajv();
  const validate = ajv.compile(configSchema);
  const valid = validate(userConfig);

  if (valid) {
    if (program.verbose) log("Configuration validated");
    return userConfig;
  } else {
    validate.errors.forEach((errObj) => {
      log.error(`error while validating schema: ${errObj.dataPath}: ${errObj.message}`);
    });
    bail("Could not validate configuration file.");
  }
};

const connectExchange = async () => {
  try {

    const { exchangeId, apiKey, apiSecret, timeout } = userConfig.exchange;
    const exchange = new ccxt[exchangeId]({
      apiKey,
      apiSecret,
      timeout
    });

    return exchange;

  } catch (err) {
    log.error(err);
  }
};

const connectStore = async () => {
  try {
    const url = "mongodb://localhost:27017"
    const dbname = "algotia"
    const options = {
      useUnifiedTopology: true
    }

    const client = new MongoClient(url, options)

    await client.connect() 

    const db = client.db(dbname)
    console.log(`Connected to ${db.databaseName} database`)
    await client.close()
  } catch (err) {
    log.error("Error connecting to database: ", err);
  }
};
