import { BootData, DeleteBackfillOptions } from "../../types";
import { getBackfillCollection, log } from "../../utils";

const deleteBackfills = async (
	bootData: BootData,
	options?: DeleteBackfillOptions
) => {
	try {
		const { client } = bootData;
		const backfillCollection = await getBackfillCollection(client);

		if (options.documentName) {
			// Delete one
			await backfillCollection.findOneAndDelete({ name: options.documentName });
		} else {
			// Delete all
			await backfillCollection.deleteMany({});
		}
	} catch (err) {
		throw err;
	}
};

export default deleteBackfills;
