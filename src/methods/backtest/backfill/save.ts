import {
	BacktestOptions,
	AllowedExchanges,
	AnyAlgotia,
	OHLCV,
	ProcessedBackfillOptions,
} from "../../../types";
import { Collection } from "mongodb";
import {
	getBackfillCollection,
	connectToDb,
	getDefaultExchange,
	buildRegexPath,
} from "../../../utils";

const initializeTree = async (backfillCollection: Collection) => {
	const exchangeNodes = AllowedExchanges.map((id) => {
		return {
			_id: id,
			path: buildRegexPath(id),
		};
	});

	await backfillCollection.insertMany([
		{
			_id: "exchanges",
			path: buildRegexPath(),
		},
		...exchangeNodes,
	]);
};

const initializeSymbolNode = async (
	backfillCollection: Collection,
	id: string,
	symbol: string
) => {
	try {
		await backfillCollection.insertOne({
			_id: `${id}-${symbol}`,
			path: buildRegexPath(id, symbol),
		});
	} catch (err) {
		throw err;
	}
};

const initializeTimeframeNode = async (
	backfillCollection: Collection,
	id: string,
	symbol: string,
	timeframe: string
) => {
	try {
		await backfillCollection.insertOne({
			_id: `${id}-${symbol}-${timeframe}`,
			path: buildRegexPath(id, symbol, timeframe),
			sets: [],
		});
	} catch (err) {
		throw err;
	}
};

const saveSet = async (
	algotia: AnyAlgotia,
	options: ProcessedBackfillOptions,
	set: OHLCV[]
) => {
	try {
		const { mongoClient } = algotia;
		const { symbol, timeframe, exchange } = options;
		const db = await connectToDb(mongoClient);
		const backfillCollection = getBackfillCollection(db);

		const rootNodeExists = await backfillCollection.findOne({
			_id: "exchanges",
		});

		if (!rootNodeExists) {
			await initializeTree(backfillCollection);
		}
		const symbolPath = buildRegexPath(exchange.id, symbol);
		const symbolNodeExists = await backfillCollection.findOne({
			path: symbolPath,
		});

		if (!symbolNodeExists) {
			await initializeSymbolNode(backfillCollection, exchange.id, symbol);
		}

		const timeframePath = buildRegexPath(exchange.id, symbol, timeframe);
		const timeframeNodeExists = await backfillCollection.findOne({
			path: timeframePath,
		});

		if (!timeframeNodeExists) {
			await initializeTimeframeNode(
				backfillCollection,
				exchange.id,
				symbol,
				timeframe
			);
		}

		await backfillCollection.updateOne(
			{ path: timeframePath },
			{ $push: { sets: { $each: set } } }
		);
	} catch (err) {
		throw err;
	}
};
export default saveSet;
