import { BootData, ListAllOptions } from "../../types";
import { getBackfillCollection, log } from "../../utils";
import BackfillRow from "./backfillRow";
import chalk from "chalk";

// List all
const listAll = async (bootData: BootData, options?: ListAllOptions) => {
	try {
		const backfillCollection = await getBackfillCollection(bootData);

		const { pretty } = options;

		const allBackfills = backfillCollection.find(
			{},
			{ projection: { _id: 0 } }
		);
		const backfillsArr = await allBackfills.toArray();

		if (backfillsArr.length) {
			const allDocs = backfillsArr.map((doc) => {
				return new BackfillRow(doc);
			});

			if (pretty) {
				console.table(allDocs);
			} else {
				log(allDocs);
			}
		} else {
			log(
				`No backfills saved. Run ${chalk.bold.underline(
					"algotia backfill -h"
				)} for help.`
			);
		}
	} catch (err) {
		await bootData.client.close();
		log.error(err);
	}
};

export default listAll;
