import { BootData, ListBackfillOptions, BackfillDocument } from "../../types";
import { getBackfillCollection, log } from "../../utils";
import { Collection } from "mongodb";

const getOneBackfill = async (
	backfillCollection: Collection,
	documentName: string
): Promise<BackfillDocument[]> => {
	try {
		const oneBackfill = await backfillCollection.findOne(
			{ name: documentName },
			{ projection: { _id: 0 } }
		);

		return [oneBackfill];
	} catch (err) {
		throw err;
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
		throw err;
	}
};

const listBackfills = async (
	bootData: BootData,
	options?: ListBackfillOptions
): Promise<BackfillDocument[]> => {
	try {
		const backfillCollection = await getBackfillCollection(bootData);

		if (options && options.documentName) {
			// List one
			const oneBackfill = await getOneBackfill(
				backfillCollection,
				options.documentName
			);
			if (oneBackfill) {
				return oneBackfill;
			} else {
				throw new Error(`No backfill named ${options.documentName} saved.`);
			}
		} else {
			// List all
			const allBackfills = await getAllBackfills(backfillCollection);

			if (allBackfills.length) {
				return allBackfills;
			} else {
				throw new Error("No backfills saved.");
			}
		}
	} catch (err) {
		throw err;
	}
};

export default listBackfills;
