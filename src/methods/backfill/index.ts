import {
	BackfillInput,
	BootData,
	BackfillDocument,
	Exchange,
	ConvertedBackfillOptions
} from "../../types/index";
import { log } from "../../utils/index";
import convertOptions from "./convertOptions";
import fetchRecords from "./fetchRecords";
import insertDocument from "./insertDocument";
import validateOptions from "./validateOptions";

// Converts and validates input and returns converted and valid options
class ValidationError extends Error {}

const processInput = async (
	exchange: Exchange,
	backfillOptions: BackfillInput
): Promise<{
	userOptions: ConvertedBackfillOptions;
	internalOptions: ConvertedBackfillOptions;
}> => {
	try {
		const internalOptions = convertOptions({
			...backfillOptions,
			period: "1m"
		});
		const userOptions = convertOptions(backfillOptions);
		await validateOptions(exchange, userOptions);

		return { internalOptions, userOptions };
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

		const { userOptions, internalOptions } = await processInput(
			exchange,
			backfillOptions
		);

		verbose && log.info(`Records to fetch ${userOptions.recordsToFetch}`);

		const { userCandles, internalCandles } = await fetchRecords(
			exchange,
			userOptions,
			internalOptions
		);

		const insertOptions = {
			userOptions,
			userCandles,
			internalCandles
		};

		if (userCandles && internalCandles) {
			const document = await insertDocument(insertOptions, client);
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
