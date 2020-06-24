import fs from "fs";
import YAML from "yaml";
import find from "find";
import bail from "../utils/bail";
import log from 'fancy-log'
import {program} from "commander"


function getConfig() {
  const {verbose, config} = program;   
	const paths: string[] = find.fileSync(/config.yaml/g, `${__dirname}/../../`);

	if (paths.length === 0) {
		bail("Error: no config files detected.");
	} else if (paths.length > 1) {
		bail("Error: multiple config files named config.yaml detected");
	}
  
  let configFile: string;

  if (config) {
    configFile = config;
  } else {
    configFile = paths[0];
  }

  if (verbose) log(`Config file detected at ${configFile}`);

	const configRaw = fs.readFileSync(configFile, "utf8");
	const userConfig = YAML.parse(configRaw);

	return userConfig
}

export default getConfig;
