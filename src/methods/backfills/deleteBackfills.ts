import { BootData, DeleteBackfillOptions } from "../../types";
import { getBackfillCollection, log } from "../../utils";

const deleteBackfills = async (
	bootData: BootData,
	options?: DeleteBackfillOptions
) => {
	try {
		const backfillCollection = await getBackfillCollection(bootData);

		if (options.documentName) {
			// Delete one
			await backfillCollection.findOneAndDelete({ name: options.documentName });
		} else {
			// Delete all
			await backfillCollection.deleteMany({});
		}
	} catch (err) {
		log.error(err);
	}
};

export default deleteBackfills;
