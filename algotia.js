require('@babel/register')({
    presets: [
      ["@babel/preset-env"],
      ["@babel/preset-react"]
    ]
});
const boot = require('./boot');


boot()
    .then(async (startupData)=>{
        const { config, store, exchange } = startupData;
        const orderbook = await exchange.fetchOHLCV('BTC/USD', 1);
        console.log(orderbook);
    })
    .catch((err)=>{
        console.log(err);
    });
