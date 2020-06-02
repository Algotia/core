import dotenv from 'dotenv'
import boot from './boot';
import createStrategy from './lib/createStrategy';

(async () => {
  try {

    const {config, store, exchange} = await boot();
    
    const strategy = createStrategy(config, exchange);

    strategy.onData(async (kraken)=>{
      try {

        const test = await kraken.fetchTickers();
        console.log(test);

      } catch (err){
        console.log(err);        
      }
      
    })

  } catch (err) {
    console.log(err); 
  }
})()
