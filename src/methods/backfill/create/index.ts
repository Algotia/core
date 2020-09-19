import {
	BackfillInput,
	BootData,
	BackfillDocument,
	ConvertedBackfillOptions,
	SingleExchange,
	MultiCandleSets,
	AllowedExchangeId,
	AllowedExchanges,
	BackfillInputError
} from "../../../types/index";
import { log } from "../../../utils/index";
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
		const { exchange, config, mongoClient } = bootData;
		const { verbose, type = "single" } = backfillOptions;

		if (type && type === "multi") {
			// MULTI EXCHANGE BACKFILL

			const exchangeKeyLength = Object.keys(exchange).length;
			if (exchangeKeyLength === 1) {
				throw new BackfillInputError(
					"Type of backfill is multi, but only one exchange is configured",
					{ ...config.exchange },
					{
						exchange: {
							binance: true,
							bitstamp: true
						}
					}
				);
			}
			if (backfillOptions.exchanges) {
				if (backfillOptions.exchanges.length === 1) {
					throw new BackfillInputError(
						"Type of backfill is multi, but only one exchange was passed to exchanges option"
					);
				}
			}

			let candles: MultiCandleSets;
			let exchangesToUse = exchange;

			if (backfillOptions.exchanges) {
				backfillOptions.exchanges.forEach((id) => {
					delete exchangesToUse[id];
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

			if (backfillOptions.exchanges && backfillOptions.exchanges.length > 1) {
				throw new BackfillInputError(
					"Backfill type is single, but multiple exchanges passed to exchanges option"
				);
			}

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
