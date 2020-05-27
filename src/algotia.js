require('dotenv').config();
const boot = require('./boot');

(async () => {
  try {

    const {config, store, exchange} = await boot();

    console.log(config);

  } catch (err) {
    console.log(err); 
  }
})()
