import { MongoClient } from "mongodb";
import createPublicApis from "./publicApi/";
import createPrivateApis from "./privateApi/";
import { Exchange } from "ccxt";
import { Tedis } from "tedis";
import { BacktestingExchange } from "../../../types";

const createBacktestingExchange = async (
	exchange: Exchange,
	client: MongoClient,
	redisClient: Tedis
): Promise<BacktestingExchange> => {
	const publicApis = createPublicApis(exchange);
	const privateApis = await createPrivateApis(exchange, client, redisClient);

	const backtestExchange = {
		...publicApis,
		...privateApis
	};

	return backtestExchange;
};

export default createBacktestingExchange;
