import { Collection } from "mongodb";
import { ProcessedBackfillOptions, AllowedExchanges } from "../../types";
import buildRegexPath from "./buildRegexPath";

const initializeBackfillTree = async (
	backfillCollection: Collection,
	options: ProcessedBackfillOptions
) => {
	try {
		const { exchange, pair, timeframe } = options;
		const rootNodeExists = await backfillCollection.findOne({
			_id: "exchanges",
		});

		console.log("ROOT NODE ", rootNodeExists);
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
		const pairPath = buildRegexPath(exchange.id, pair);
		const pairPathExists = await backfillCollection.findOne({
			path: pairPath,
		});

		if (!pairPathExists) {
			await backfillCollection.insertOne({
				_id: `${exchange.id}-${pair}`,
				path: pairPath,
			});
		}

		const timeframePath = buildRegexPath(exchange.id, pair, timeframe);
		const timeframeNodeExists = await backfillCollection.findOne({
			path: timeframePath,
		});

		if (!timeframeNodeExists) {
			await backfillCollection.insertOne({
				_id: `${exchange.id}-${pair}-${timeframe}`,
				path: timeframePath,
				sets: [],
			});
		}
	} catch (err) {
		throw err;
	}
};

export default initializeBackfillTree;
