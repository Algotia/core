const Sequelize = require('sequelize');
const ccxt = require('ccxt');

const userConfig = require('./config/config');


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
        // Check config for shape, data types, and API key validation
        //TODO: do actual checks
    
        return userConfig

    } catch (err) {
        console.log('Error validating configuration: ', err)
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
        let dbPath = './db/store.sqlite'
        const sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: dbPath
        })
        await sequelize.authenticate();
        console.log('Connected to databse');
        
        return sequelize;

    } catch (err) {
        console.log('Error connecting to databse: ', err);
    }
}
