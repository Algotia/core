const Sequelize = require('sequelize');
const ccxt = require('ccxt');
const fs = require('fs');
const YAML = require('yaml');
const Ajv  = require('ajv');

module.exports = async () => {
    try {
        
        let bootData = {};

        const config = await validateConfig();
        const store = await connectStore();
        const exchange = await connectExchange(config);

        bootData.config = config;
        bootData.db = store;
        bootData.exchange = exchange;

        return bootData;
        
    } catch (err) {

        console.log('Error in boot phase: ', err);

    }
}

const validateConfig = async () => {
    try {
        // Schema is generated at build-time with typescript-json-schema
        const configFile = fs.readFileSync(`${__dirname}/config/config.yaml`, 'utf8');
        const schemaFile = fs.readFileSync(`${__dirname}/config/utils/configSchema.json`, 'utf8');
        
        const configScehma = JSON.parse(schemaFile);
        const userConfig = YAML.parse(configFile);
        
        const ajv = new Ajv();

        const validate = ajv.compile(configScehma);
        const valid = validate(userConfig);

        if(valid){

            console.log('Configuration validated');
            return userConfig

        } else {

            validate.errors.forEach((errorObj)=>{
                console.log(`Error at ${errorObj.dataPath}: ${errorObj.message}`);
            });
            process.kill(process.pid, 'SIGINT');

        }

    } catch (err) {

        console.log('Error validating configuration: ', err);

    }
}

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
}

const connectStore = async () => {
    try {
        // connect to db and return intance
        let dbPath = `${__dirname}/db/store.sqlite`
        const sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: dbPath,
            logging: false
        })
        await sequelize.authenticate();
        console.log('Connected to databse');
        
        return sequelize;

    } catch (err) {

        console.log('Error connecting to databse: ', err);

    }
 }
