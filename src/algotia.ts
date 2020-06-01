import dotenv from 'dotenv'
import boot from './boot';

(async () => {
  try {

    const {config, store, exchange} = await boot();

    console.log(config);

  } catch (err) {
    console.log(err); 
  }
})()
