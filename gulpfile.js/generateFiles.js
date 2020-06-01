const { exec } = require('child_process')
const {error, info} = require('./logs');

function generateFiles(cb){
    //TODO: Change this over to the programmatic API
    exec(' npx typescript-json-schema ./src/config/configInterface.ts Config --out ./src/config/configSchema.json', (err, stdout, stderr)=>{
        if (err){ 
            error('Could not generate files -- ' + err);
            cb(new Error('Error generating JSON Schema from Typescript interface.'));
        };
    });
    info("Generated files");
    cb();
}

module.exports = generateFiles;
