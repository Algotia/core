import { BootData, ListBackfillOptions, BackfillDocument } from "../../types";
import { getBackfillCollection, log } from "../../utils";
import BackfillRow from "./backfillRow";
import chalk from "chalk";
import { Collection } from "mongodb";

const getOneBackfill = async (
	backfillCollection: Collection,
	documentName: string
): Promise<BackfillDocument> => {
	try {
		const oneBackfill = await backfillCollection.findOne(
			{ name: documentName },
			{ projection: { _id: 0 } }
		);

		return oneBackfill;
	} catch (err) {
		log.error(err);
	}
};

const getAllBackfills = async (
	backfillCollection: Collection
): Promise<BackfillDocument[]> => {
	try {
		const allBackfills = await backfillCollection
			.find({}, { projection: { _id: 0 } })
			.toArray();

		return allBackfills;
	} catch (err) {
		log.error(err);
	}
};

const listBackfills = async (
	bootData: BootData,
	options?: ListBackfillOptions
) => {
	try {
		const backfillCollection = await getBackfillCollection(bootData);

		if (options.documentName) {
			// List one logic
			const oneBackfill = await getOneBackfill(
				backfillCollection,
				options.documentName
			);

			if (options.pretty) {
				console.table([BackfillRow(oneBackfill)]);
			} else {
				console.log(oneBackfill);
			}

			return oneBackfill;
		} else {
			// List all logic
			const allBackfills = await getAllBackfills(backfillCollection);

			if (allBackfills.length) {
				if (options.pretty) {
					const prettyBackfills = allBackfills.map((backfill) => {
						return new BackfillRow(backfill);
					});

					console.table(prettyBackfills);
				} else {
					console.log(allBackfills);
				}

				return allBackfills;
			} else {
				throw new Error("No backfills saved.");
			}
		}
	} catch (err) {
		await bootData.client.close();
		log.error(err);
	}
};

export default listBackfills;
