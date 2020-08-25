import { MongoClient } from "mongodb";
import createPublicApis from "./publicApi/";
import createPrivateApis from "./privateApi/";
import { Exchange } from "ccxt";

const createBacktestingExchange = async (
	exchange: Exchange,
	client: MongoClient
): Promise<Partial<Exchange>> => {
	const publicApis = createPublicApis(exchange);
	const privateApis = await createPrivateApis(exchange, client);

	const backtestExchange = {
		...publicApis,
		...privateApis
	};

	return backtestExchange;
};

export default createBacktestingExchange;
