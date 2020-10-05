import { Collection } from "mongodb";
import { ProcessedBackfillOptions, AllowedExchanges } from "../../types";
import buildRegexPath from "./buildRegexPath";

const initializeBackfillTree = async (
	backfillCollection: Collection,
	options: ProcessedBackfillOptions
) => {
	try {
		const { exchange, symbol, timeframe } = options;
		const rootNodeExists = await backfillCollection.findOne({
			_id: "exchanges",
		});

		if (!rootNodeExists) {
			await backfillCollection.insertMany([
				{
					_id: "exchanges",
					path: buildRegexPath(),
				},
				...AllowedExchanges.map((id) => ({
					_id: id,
					path: buildRegexPath(id),
				})),
			]);
		}
		const symbolPath = buildRegexPath(exchange.id, symbol);
		const symbolNodeExists = await backfillCollection.findOne({
			path: symbolPath,
		});

		if (!symbolNodeExists) {
			await backfillCollection.insertOne({
				_id: `${exchange.id}-${symbol}`,
				path: symbolPath,
			});
		}

		const timeframePath = buildRegexPath(exchange.id, symbol, timeframe);
		const timeframeNodeExists = await backfillCollection.findOne({
			path: timeframePath,
		});

		if (!timeframeNodeExists) {
			await backfillCollection.insertOne({
				_id: `${exchange.id}-${symbol}-${timeframe}`,
				path: timeframePath,
				sets: [],
			});
		}
	} catch (err) {
		throw err;
	}
};

export default initializeBackfillTree;
