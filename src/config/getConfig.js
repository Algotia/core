const fs = require('fs');
const YAML = require('yaml');
const find = require('find');
const kill = require('../utils/kill');


function getConfig () {

    const paths = find.fileSync(/config.yaml/g,`${__dirname}/../../`);

    if (paths.length > 1) {
        kill("Error: more than one file named config.yaml");
    }
    
    const configPath = paths[0];
    const configRaw = fs.readFileSync(configPath, 'utf8');
    const config = YAML.parse(configRaw);

    return config
}
getConfig();
module.exports = getConfig;

