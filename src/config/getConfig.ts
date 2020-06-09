import fs from "fs";
import YAML from "yaml";
import find from "find";
import bail from "../utils/bail";

export default function getConfig() {
	const paths: string[] = find.fileSync(/config.yaml/g, `${__dirname}/../../`);

	if (paths.length === 0) {
		bail("Error: no config files detected.");
	} else if (paths.length > 1) {
		bail("Error: multiple config files named config.yaml detected");
	}
	console.log(`Config file detected at ${paths[0]}`);
	const configPath: string = paths[0];
	const configRaw = fs.readFileSync(configPath, "utf8");
	const config = YAML.parse(configRaw);

	return config;
}
