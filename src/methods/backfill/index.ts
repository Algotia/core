import { BackfillInput, BootData, BackfillDocument } from "../../types/index";
import { log } from "../../utils/index";
import convertOptions from "./convertOptions";
import fetchRecords from "./fetchRecords";
import insertDocument from "./insertDocument";
import validateOptions from "./validateOptions";
import { Exchange } from "ccxt";

// Converts and validates input and returns converted and valid options
class ValidationError extends Error {}

const processInput = async (
	exchange: Exchange,
	backfillOptions: BackfillInput
) => {
	try {
		//TODO: Option validation
		const convertedOptions = convertOptions(backfillOptions);
		await validateOptions(exchange, convertedOptions);

		return convertedOptions;
	} catch (err) {
		throw new ValidationError(
			`Error while validating backfill options \n ${err}`
		);
	}
};

const backfill = async (
	bootData: BootData,
	backfillOptions: BackfillInput
): Promise<BackfillDocument> => {
	try {
		const { exchange, client } = bootData;
		const { verbose } = backfillOptions;

		const convertedOptions = await processInput(exchange, backfillOptions);

		verbose && log.info(`Records to fetch ${convertedOptions.recordsToFetch}`);

		const records = await fetchRecords(exchange, convertedOptions);

		const insertOptions = {
			convertedOptions,
			records
		};

		const document = await insertDocument(insertOptions, client);

		verbose &&
			log.success(`Wrote document ${document.name} to the backfill collection`);

		return document;
	} catch (err) {
		throw err;
	}
};

export default backfill;
