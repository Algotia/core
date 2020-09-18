import {
	BackfillInput,
	BootData,
	BackfillDocument,
	ConvertedBackfillOptions,
	SingleExchange,
	MultiCandleSets,
	ExchangeObj,
	AllowedExchangeId,
	AllowedExchanges
} from "../../types/index";
import { log } from "../../utils/index";
import convertOptions from "./convertOptions";
import fetchRecords from "./fetchRecords";
import insertDocument from "./insertDocument";
import validateOptions from "./validateOptions";

// Converts and validates input and returns converted and valid options
const processInput = async (
	exchange: SingleExchange,
	backfillInput: BackfillInput
): Promise<ConvertedBackfillOptions> => {
	try {
		const convertedOptions = convertOptions(backfillInput, exchange);
		await validateOptions(exchange, convertedOptions);

		return convertedOptions;
	} catch (err) {
		throw err;
	}
};

const backfill = async (
	bootData: BootData,
	backfillOptions: BackfillInput
): Promise<BackfillDocument> => {
	try {
		const { exchange, mongoClient, eventBus } = bootData;
		const { verbose, type = "single" } = backfillOptions;

		if (type && type === "multi") {
			// MULTI EXCHANGE BACKFILL
			let candles: MultiCandleSets;
			let exchangesToUse: ExchangeObj;
			if (backfillOptions.exchanges) {
				backfillOptions.exchanges.forEach((id) => {
					exchangesToUse = {
						...exchangesToUse,
						[id]: exchange[id]
					};
				});
			} else {
				exchangesToUse = exchange;
			}

			let usedExchanges = [];
			for (const id in exchangesToUse) {
				if (exchangesToUse.hasOwnProperty(id)) {
					usedExchanges.push(id);
					const singleExchange: SingleExchange = exchange[id];
					const exchangeId = singleExchange.id;
					const options = await processInput(singleExchange, backfillOptions);
					const records = await fetchRecords(singleExchange, options);
					candles = {
						...candles,
						[exchangeId]: records
					};
				}
			}
			if (Object.keys(candles).length === Object.keys(exchange).length) {
				const document = await insertDocument(
					{ ...backfillOptions, ...{ exchanges: usedExchanges } },
					candles,
					mongoClient
				);
				return document;
			}
		} else {
			// SINGLE EXCHANGE BACKFILL
			const isAllowedExchangeId = (str: string): str is AllowedExchangeId => {
				if (AllowedExchanges.includes(str as AllowedExchangeId)) return true;
			};

			const exchangeIds = Object.keys(exchange);
			let singleExchange: SingleExchange;
			if (backfillOptions.exchanges) {
				singleExchange = exchange[backfillOptions.exchanges[0]];
			} else {
				singleExchange = exchange[exchangeIds[0]];
			}
			const options = await processInput(singleExchange, backfillOptions);

			verbose && log.info(`Records to fetch ${options.recordsToFetch}`);
			//eventBus.emit("backfill.start", { recordsToFetch: options.recordsToFetch });

			const candles = await fetchRecords(singleExchange, options);
			if (candles) {
				let exchanges: AllowedExchangeId[];
				if (isAllowedExchangeId(exchangeIds[0])) {
					exchanges = [exchangeIds[0]];
				}
				const document = await insertDocument(
					{ ...backfillOptions, ...{ exchanges } },
					candles,
					mongoClient
				);
				return document;
			}
		}
	} catch (err) {
		throw err;
	}
};

export default backfill;
