import { BootData, ListOneOptions } from "../../types";
import { log, getBackfillCollection } from "../../utils";
import BackfillRow from "./backfillRow";
import chalk from "chalk";

const listOne = async (bootData: BootData, options?: ListOneOptions) => {
	try {
		const backfillCollection = await getBackfillCollection(bootData);

		const { documentName, pretty } = options;

		const oneBackfill = await backfillCollection.findOne(
			{ name: documentName },
			{ projection: { _id: 0 } }
		);

		if (oneBackfill) {
			if (pretty) {
				console.table([new BackfillRow(oneBackfill)]);
			} else {
				log(oneBackfill);
			}
			return oneBackfill;
		} else {
			log.error(
				`No backfill named ${documentName} saved. Run ${chalk.bold.underline(
					"algotia backfills list"
				)} to see saved documents.`
			);
		}
	} catch (err) {
		await bootData.client.close();
		log.error(err);
	}
};

export default listOne;
