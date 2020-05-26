require('dotenv').config();
const boot = require('./boot');

(async () => {
  try {

    const {config, store, exchange} = await boot();

    const OHLCV = await exchange.fetchOHLCV('BTC/USD', 1);
    console.log(OHLCV);

  } catch (err) {
    console.log(err); 
  }
})()
