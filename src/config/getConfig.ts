import fs from 'fs'
import YAML from 'yaml'
import find from 'find'
import kill from '../utils/kill'


export default function getConfig () {

    const paths: [string] = find.fileSync(/config.yaml/g,`${__dirname}/../../`);

    if (paths.length > 1) {
        kill("Error: more than one file named config.yaml");
    }
    
    const configPath: string = paths[0];
    const configRaw = fs.readFileSync(configPath, 'utf8');
    const config = YAML.parse(configRaw);

    return config
}


