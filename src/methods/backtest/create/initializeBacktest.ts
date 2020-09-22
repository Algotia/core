import {
	BacktestInput,
	BootData,
	BackfillDocument,
	SingleExchange,
	MultiBalance,
	SingleBalance,
	AllowedExchanges,
	BacktestingExchange,
	AllowedExchangeId,
	MultiInitData,
	SingleInitData
} from "../../../types";
import { getBackfillCollection, encodeObject } from "../../../utils";
import createBacktestingExchange from "../createExchange";
import { WithId, MongoClient } from "mongodb";

const isMultiBalance = (
	obj: SingleBalance | MultiBalance
): obj is MultiBalance => {
	return Object.keys(obj).some((id: any) => AllowedExchanges.includes(id));
};

// Gets single backfill document
const getSingleBackfill = async (name: string, mongoClient: MongoClient) => {
	const backfillCollection = await getBackfillCollection(mongoClient);
	const singleBackfill = await backfillCollection.findOne({ name });
	if (!singleBackfill) {
		throw new Error(`Backfill ${name} does not exists in database`);
	}
	return singleBackfill;
};

// returns encoded initial balance
const initializeBalance = (initialBalance: SingleBalance) => {
	const balance = {
		info: {
			free: initialBalance.quote,
			used: 0,
			total: initialBalance.quote
		},
		base: {
			free: initialBalance.base,
			used: 0,
			total: initialBalance.base
		},
		quote: {
			free: initialBalance.quote,
			used: 0,
			total: initialBalance.quote
		}
	};
	const encodedBalance = encodeObject(balance);
	return encodedBalance;
};

const initializeMulti = async (
	bootData: BootData,
	input: BacktestInput
): Promise<MultiInitData> => {
	try {
		const { mongoClient, redisClient, exchange } = bootData;
		const { backfillName, initialBalance } = input;

		const backfill: WithId<BackfillDocument> = await getSingleBackfill(
			backfillName,
			mongoClient
		);

		if (backfill.type === "single") {
			throw new Error("Backtest type multi, but backfill type single");
		}
		if (!isMultiBalance(initialBalance)) {
			throw new Error("Backtest type multi, but single intialBalance provided");
		}

		let allBacktestingExchanges;

		for (const exchangeId in initialBalance) {
			if (initialBalance.hasOwnProperty(exchangeId)) {
				const thisExchange: SingleExchange = exchange[exchangeId];
				const thisBalance = initialBalance[exchangeId];
				const startingBalance = initializeBalance(thisBalance);

				await redisClient.hmset(`${exchangeId}-balance`, {
					...startingBalance
				});

				const backtestingExchange = await createBacktestingExchange({
					mongoClient,
					redisClient,
					exchange: thisExchange
				});

				allBacktestingExchanges = {
					...allBacktestingExchanges,
					[exchangeId]: backtestingExchange
				};
			}
		}
		return {
			backfill,
			exchanges: { ...allBacktestingExchanges }
		};
	} catch (err) {
		throw err;
	}
};

const initializeSingle = async (
	bootData: BootData,
	input: BacktestInput
): Promise<SingleInitData> => {
	try {
		const { mongoClient, redisClient, exchange } = bootData;
		const { backfillName, initialBalance } = input;

		const backfill: WithId<BackfillDocument> = await getSingleBackfill(
			backfillName,
			mongoClient
		);
		const exchangeId = backfill.exchanges[0];

		if (backfill.type === "multi") {
			throw new Error("Backtest type single, but backfill type multi");
		}
		if (!Object.keys(exchange).includes(exchangeId)) {
			throw new Error(`Exchange ${exchangeId} does not exist in configuration`);
		}

		if (isMultiBalance(initialBalance)) {
			throw new Error(
				"Backtest type single, but multiple intialBalance provided"
			);
		}

		const thisExchange = exchange[exchangeId];
		const startingBalance = initializeBalance(initialBalance);

		await redisClient.hmset("balance", {
			...startingBalance
		});

		const backtestingExchange = await createBacktestingExchange({
			mongoClient,
			redisClient,
			exchange: thisExchange
		});

		return {
			backfill,
			exchange: backtestingExchange
		};
	} catch (err) {
		throw err;
	}
};

const initializeBacktest = async (
	bootData: BootData,
	input: BacktestInput
): Promise<SingleInitData | MultiInitData> => {
	try {
		const { type = "single" } = input;

		if (type === "multi") {
			return await initializeMulti(bootData, input);
		}
		if (type === "single") {
			return await initializeSingle(bootData, input);
		}
	} catch (err) {
		throw err;
	}
};

export default initializeBacktest;
