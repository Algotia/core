import { BackfillOptions, BootData, BackfillDocument } from "../../types/index";
import { log } from "../../utils/index";
import convertOptions from "./convertOptions";
import fetchRecords from "./fetchRecords";
import insertDocument from "./insertDocument";
import validateOptions from "./validateOptions";

// Converts and validates input and returns converted and valid options
const processInput = (backfillOptions: BackfillOptions) => {
	try {
		//TODO: Option validation
		const convertedOptions = convertOptions(backfillOptions);

		return convertedOptions;
	} catch (err) {
		throw `Error while validating backfill options \n ${err}`;
	}
};

const backfill = async (
	bootData: BootData,
	backfillOptions: BackfillOptions
): Promise<BackfillDocument> => {
	try {
		const { exchange, client } = bootData;

		const userInput = processInput(backfillOptions);

		await validateOptions(exchange, userInput);

		const {
			sinceMs,
			untilMs,
			recordsToFetch,
			recordLimit,
			pair,
			period,
			periodMs,
			documentName,
			verbose
		} = userInput;

		verbose && log.info(`Records to fetch ${recordsToFetch}`);

		const fetchRecordsOptions = {
			sinceMs,
			period,
			periodMs,
			pair,
			recordLimit,
			recordsToFetch,
			verbose
		};

		const allRecords = await fetchRecords(exchange, fetchRecordsOptions);

		const insertDocumentOptions = {
			sinceMs,
			untilMs,
			period,
			pair,
			allRecords,
			documentName
		};

		const document = await insertDocument(insertDocumentOptions, client);

		verbose &&
			log.success(`Wrote document ${document.name} to the backfill collection`);

		return document;
	} catch (err) {
		throw err;
	}
};

export default backfill;
