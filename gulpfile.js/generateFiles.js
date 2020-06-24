const tjs = require('ts-json-schema-generator');
const { error, info } = require('./logs');
const fs = require('fs');
const path = require('path')

function generateFiles(cb) {

    // Generate JSON schema from config TS interface 
    const config = {
        path: "src/types/interfaces/config.ts",
        type: "*",
    };

    const outputPath = process.cwd() +  "/dist/config/config.schema.json";
    const outputDir = path.dirname(outputPath)
  
    const schema = tjs.createGenerator(config).createSchema(config.type)
    const schemaString = JSON.stringify(schema, null, 2);
  
    fs.mkdirSync(outputDir)
    fs.writeFile(outputPath, schemaString, { flag: 'wx' }, (err) => {
        if (err) error(err);
    });

    info("Generated files");
    cb();

}

module.exports = generateFiles;
