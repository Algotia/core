import {
	BackfillDocument,
	ActiveBacktestDocument,
	Collections
} from "../../../../../types";
import getActiveBacktest from "./getActiveBacktest";

const getDataSet = async (
	collections: Collections
): Promise<BackfillDocument> => {
	try {
		const thisBacktest: ActiveBacktestDocument = await getActiveBacktest(
			collections
		);
		const backfillId = thisBacktest.backfillId;

		return await collections.backfill.findOne(backfillId);
	} catch (err) {
		throw err;
	}
};

export default getDataSet;
