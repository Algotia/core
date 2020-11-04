import {Exchange} from "ccxt"

interface BacktestOptions {
    exchange: string;
    from: Date | number | string;
    to: Date | number | string;
    pair: string;
    period: string;
    strategy: () => void;
}

interface ProcessedBacktestOptions extends BacktestOptions {
	from: number;
	to: number;
}

const backtest = async (options: BacktestOptions) => {
    try {
        // VALIDATE		
		// PROCESS
		// CHECK CACHED RECORDS
	    // GET NEW RECORDS	
		// CACHE NEW RECORDS
		// RUN STRATEGY
		// COLLECT RESULTS
    } catch (err) {
        throw err
    }
}

