import {
	BacktestOptions,
	AllowedExchanges,
	AnyAlgotia,
	OHLCV,
} from "../../../types";
import { Collection } from "mongodb";
import {
	getBackfillCollection,
	connectToDb,
	getDefaultExchangeId,
	buildRegexPath,
} from "../../../utils";

const initializeTree = async (backfillCollection: Collection) => {
	const exchangeNodes = AllowedExchanges.map((id) => {
		return {
			_id: id,
			path: buildRegexPath(id),
		};
	});

	backfillCollection.insertMany([
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
		});
	} catch (err) {
		throw err;
	}
};

const saveSet = async (
	algotia: AnyAlgotia,
	options: BacktestOptions,
	set: OHLCV[]
) => {
	try {
		const { mongoClient, config } = algotia;
		const { symbol, timeframe } = options;
		const db = await connectToDb(mongoClient);
		const backfillCollection = getBackfillCollection(db);

		const rootNodeExists = await backfillCollection.findOne({
			_id: "exchanges",
		});

		if (!rootNodeExists) {
			await initializeTree(backfillCollection);
		}

		const defaultExchangeId = getDefaultExchangeId(config);

		const symbolPath = buildRegexPath(defaultExchangeId, symbol);
		const symbolNodeExists = await backfillCollection.findOne({
			path: new RegExp(symbolPath),
		});

		if (!symbolNodeExists) {
			await initializeSymbolNode(backfillCollection, defaultExchangeId, symbol);
		}

		const timeframePath = buildRegexPath(defaultExchangeId, symbol, timeframe);
		const timeframeNodeExists = await backfillCollection.findOne({
			path: new RegExp(timeframePath),
		});

		if (!timeframeNodeExists) {
			await initializeTimeframeNode(
				backfillCollection,
				defaultExchangeId,
				symbol,
				timeframe
			);
		}

		await backfillCollection.findOneAndUpdate(
			{ path: new RegExp(timeframePath) },
			{ $push: { sets: set } }
		);
	} catch (err) {
		throw err;
	}
};
export default saveSet;
