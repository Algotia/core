import { BackfillOptions, BootData, BackfillDocument } from "../../types/index";
import { log } from "../../utils/index";
import convertOptions from "./convertOptions";
import fetchRecords from "./fetchRecords";
import insertDocument from "./insertDocument";

// Converts and validates input and returns converted and valid options

const backfill = async (
	bootData: BootData,
	backfillOptions: BackfillOptions
): Promise<BackfillDocument> => {
	try {
		const { exchange, client } = bootData;
		const { verbose } = backfillOptions;

		const convertedOptions = convertOptions(backfillOptions);

		verbose && log.info(`Records to fetch ${convertedOptions.recordsToFetch}`);

		const records = await fetchRecords(exchange, convertedOptions);

		const insertOptions = {
			convertedOptions,
			records
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
