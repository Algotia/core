const { exec } = require('child_process');
const tjs = require('ts-json-schema-generator');
const { error, info } = require('./logs');
const fs = require('fs');
const { dsx } = require('ccxt');

function generateFiles(cb) {

    const config = {
        path: "./src/config/configInterface.ts",
        type: "*",
    };


    const outputPath = "./dist/config/config.schema.json";
    const schema = tjs.createGenerator(config).createSchema(config.type)
    const schemaString = JSON.stringify(schema, null, 2);

    fs.writeFile(outputPath, schemaString, { flag: 'wx' }, (err) => {
        if (err) error(err);
    });

    info("Generated files");
    cb();

}

module.exports = generateFiles;
