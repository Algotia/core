import { BootData, DeleteBackfillInput } from "../../types";
import { getBackfillCollection } from "../../utils";

const deleteBackfills = async (
	bootData: BootData,
	options?: DeleteBackfillInput
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
