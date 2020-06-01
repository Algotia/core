import Sequelize from 'sequelize'
import ccxt from 'ccxt'
import fs from 'fs'
import Ajv  from 'ajv'

import getConfig from './config/getConfig'
import { kill } from './utils/index'

export default async () => {
    try {

        const config = await validateConfig();
        const store = await connectStore();
        const exchange = await connectExchange(config);

        return {config, store, exchange};
        
    } catch (err) {

        console.log('Error in boot phase: ', err);

    }
}

const validateConfig = async () => {
    try {
        // Schema is generated at build-time with typescript-json-schema
        const schemaFile = fs.readFileSync(`${__dirname}/config/configSchema.json`, 'utf8');
        const configScehma = JSON.parse(schemaFile);

        const config = getConfig();
        const ajv = new Ajv();
        const validate = ajv.compile(configScehma);
        const valid = validate(config);


        if(valid){

            console.log('Configuration validated');
            return config

        } else {

            validate.errors.forEach((errorObj)=>{
                console.log(`Error while validating schema: ${errorObj.dataPath}: ${errorObj.message}`);
            });
            kill();

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

        const store = {}
        console.log('Connected to databse');
        
        return store;

    } catch (err) {

        console.log('Error connecting to databse: ', err);

    }
 }
