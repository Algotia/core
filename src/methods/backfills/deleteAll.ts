import { BootData, DeleteAllOptions } from "../../types";
import { getBackfillCollection, log } from "../../utils";

const deleteAll = async (bootData: BootData, options?: DeleteAllOptions) => {
	try {
		const { verbose } = options;

		const backfillCollection = await getBackfillCollection(bootData);

		const allBackfills = backfillCollection.find({});
		const backfillsArr = await allBackfills.toArray();
		const backfillsLength = backfillsArr.length;
		if (backfillsLength) {
			if (verbose) {
				log.info("Deleting the following documents:");
				backfillsArr.forEach((doc) => {
					console.log("     " + doc.name);
				});
			}
			await backfillCollection.drop();
			log.success(
				`Deleted ${backfillsLength} ${
					backfillsLength > 1 ? "documents" : "document"
				} from the database.`
			);
		} else {
			log.error(`No documents to delete.`);
		}
	} catch (err) {
		await bootData.client.close();
		log.error(err);
	}
};

export default deleteAll;
