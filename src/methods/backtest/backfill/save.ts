import {
	AnyAlgotia,
	SingleBacktestOptions,
	MultiBacktestOptions,
	SingleBackfillSet,
	MultiBackfillSet,
	isMultiBacktestOptions,
	isSingleBacktestOptions,
	isMultiBackfillSet,
	isSingleBackfillSet,
	AllowedExchanges,
	ExchangeID,
	OHLCV,
} from "../../../types";
import {
	connectToDb,
	getDefaultExchangeId,
	getBackfillCollection,
} from "../../../utils";
import { Collection } from "mongodb";

const setupBackfillCollection = async (
	backfillCollection: Collection
): Promise<void> => {
	const exchangeNodes = AllowedExchanges.map((id) => ({
		node: id,
		path: `,${id},`,
	}));
	await backfillCollection.insertMany([
		{ node: "exchanges", path: null },
		...exchangeNodes,
	]);
};

const checkIfNeedToSetupCollection = async (
	backfillCollection: Collection
): Promise<boolean> => {
	const count = await backfillCollection.find({ node: "exchanges" }).count();
	if (count === 0) {
		return true;
	}
	return false;
};

const buildDocumentTree = async (
	backfillCollection: Collection,
	id: ExchangeID,
	symbol: string,
	timeframe: string
): Promise<void> => {
	const symbolPath = `,${id},${symbol},`,
		symbolRegex = new RegExp(`/${symbolPath}/`),
		doesSymbolExist = await backfillCollection.findOne({
			path: symbolRegex,
		});

	const timeframePath = `,${id},${symbol},${timeframe},`,
		timeframeRegex = new RegExp(`/${timeframePath}/`),
		doesTimeframeExist = await backfillCollection.findOne({
			path: timeframeRegex,
		});

	if (!doesSymbolExist) {
		await backfillCollection.insertOne({
			node: symbol,
			path: symbolPath,
		});
	}
	if (!doesTimeframeExist) {
		await backfillCollection.insertOne({
			node: timeframe,
			path: timeframePath,
			sets: [],
		});
	}
};

const insertSet = async (
	backfillCollection: Collection,
	set: OHLCV[],
	id: ExchangeID,
	symbol: string,
	timeframe: string
) => {
	try {
		const regexPath = new RegExp(`,${id},${symbol},${timeframe},`);
		await backfillCollection.updateOne(
			{ path: regexPath },
			{
				$push: {
					sets: set,
				},
			}
		);
	} catch (err) {
		throw err;
	}
};

async function save(
	algotia: AnyAlgotia,
	options: SingleBacktestOptions,
	records: SingleBackfillSet
);

async function save(
	algotia: AnyAlgotia,
	options: MultiBacktestOptions,
	records: MultiBackfillSet
);

async function save(
	algotia: AnyAlgotia,
	options: SingleBacktestOptions | MultiBacktestOptions,
	records: SingleBackfillSet | MultiBackfillSet
) {
	try {
		if (isMultiBacktestOptions(options)) {
			if (isMultiBackfillSet(records)) {
				console.log(records);
			} else {
				throw new Error("Options is type multi but set is type single");
			}
		} else if (isSingleBacktestOptions(options)) {
			if (isSingleBackfillSet(records)) {
				const { mongoClient, config } = algotia,
					{ symbol, timeframe } = options,
					db = await connectToDb(mongoClient),
					backfillCollection = getBackfillCollection(db),
					id = getDefaultExchangeId(config);

				const needToSetup = await checkIfNeedToSetupCollection(
					backfillCollection
				);
				if (needToSetup) {
					await setupBackfillCollection(backfillCollection);
				}

				const pairDocument = await backfillCollection
					.find({
						path: `,${id},${symbol},${timeframe}`,
					})
					.count();
				if (pairDocument) {
				} else {
					await buildDocumentTree(backfillCollection, id, symbol, timeframe);
					await insertSet(backfillCollection, records, id, symbol, timeframe);
				}
			} else {
				throw new Error("Options type is single but set type is multi");
			}
		}
	} catch (err) {
		throw err;
	} finally {
		algotia.quit();
	}
}

export default save;
