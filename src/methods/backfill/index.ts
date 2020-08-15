import { BackfillOptions, BootData, BackfillDocument } from "../../types/index";
import { log } from "../../utils/index";
import convertOptions from "./convertOptions";
import fetchRecords from "./fetchRecords";
import insertDocument from "./insertDocument";

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
		} = processInput(backfillOptions);

		verbose && log.info(`Records to fetch ${recordsToFetch}`);

		const fetchOptions = {
			sinceMs,
			period,
			periodMs,
			pair,
			recordLimit,
			recordsToFetch,
			verbose
		};

		const allRecords = await fetchRecords(exchange, fetchOptions);

		const insertOptions = {
			sinceMs,
			untilMs,
			period,
			pair,
			allRecords,
			documentName
		};

		const backfillDocument = await insertDocument(insertOptions, client);

		verbose &&
			log.success(
				`Wrote document ${backfillDocument.name} to the backfill collection`
			);

		return backfillDocument;
	} catch (err) {
		log.error(err);
	}
};

export default backfill;
