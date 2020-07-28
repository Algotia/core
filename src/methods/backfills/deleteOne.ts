import { BootData, DeleteOneOptions } from "../../types";
import { getBackfillCollection, log } from "../../utils";

const deleteOne = async (bootData: BootData, options: DeleteOneOptions) => {
	try {
		const { verbose, documentName } = options;
		const backfillCollection = await getBackfillCollection(bootData);
		const oneBackfill = await backfillCollection.findOne({
			name: documentName
		});

		if (oneBackfill) {
			verbose && log.info(`Deleting ${documentName}`);

			await backfillCollection.deleteOne({ name: documentName });
			verbose &&
				log.success(`Deleted document ${documentName} from the database.`);

			return oneBackfill;
		} else {
			throw new Error(`No documents name ${documentName}.`);
		}
	} catch (err) {
		await bootData.client.close();
		log.error(err);
	}
};

export default deleteOne;
