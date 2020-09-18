import {
	BackfillInput,
	BootData,
	BackfillDocument,
	ConvertedBackfillOptions,
	SingleExchange,
	SingleCandleSet,
	MultiCandleSets
} from "../../types/index";
import { log, isMultiExchange } from "../../utils/index";
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
		const { verbose, type } = backfillOptions;

		if (type && type === "multi") {
			// MULTI EXCHANGE BACKFILL
			let candles: MultiCandleSets;

			for (const id in exchange) {
				const singleExchange: SingleExchange = exchange[id];
				const exchangeId = singleExchange.id;
				const options = await processInput(singleExchange, backfillOptions);
				const records = await fetchRecords(singleExchange, options);
				candles = {
					...candles,
					[exchangeId]: records
				};
			}
			if (Object.keys(candles).length === Object.keys(exchange).length) {
				const document = await insertDocument(
					backfillOptions,
					candles,
					mongoClient
				);
				return document;
			}
		} else {
			// SINGLE EXCHANGE BACKFILL

			const exchangeIds = Object.keys(exchange);
			let singleExchange: SingleExchange = exchange[exchangeIds[0]];
			const options = await processInput(singleExchange, backfillOptions);

			verbose && log.info(`Records to fetch ${options.recordsToFetch}`);
			//eventBus.emit("backfill.start", { recordsToFetch: options.recordsToFetch });

			const candles = await fetchRecords(singleExchange, options);
			if (candles) {
				const document = await insertDocument(
					backfillOptions,
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
