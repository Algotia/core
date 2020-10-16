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
			path: buildRegexPath(),
		});

		if (!rootNodeExists) {
			await backfillCollection.insertMany([
				{
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
	} catch (err) {
		throw err;
	}
};

export default initializeBackfillTree;
