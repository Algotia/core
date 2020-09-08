import {
	BackfillInput,
	BootData,
	BackfillDocument,
	ConvertedBackfillOptions,
	AnyExchange
} from "../../types/index";
import { log } from "../../utils/index";
import convertOptions from "./convertOptions";
import fetchRecords from "./fetchRecords";
import insertDocument from "./insertDocument";
import validateOptions from "./validateOptions";

// Converts and validates input and returns converted and valid options
const processInput = async (
	exchange: AnyExchange,
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
		const { exchange, mongoClient } = bootData;
		const { verbose } = backfillOptions;

		const options = await processInput(exchange, backfillOptions);

		verbose && log.info(`Records to fetch ${options.recordsToFetch}`);

		const candles = await fetchRecords(exchange, options);

		if (candles) {
			const document = await insertDocument(options, candles, mongoClient);
			verbose &&
				log.success(
					`Wrote document ${document.name} to the backfill collection`
				);

			return document;
		}
	} catch (err) {
		throw err;
	}
};

export default backfill;
