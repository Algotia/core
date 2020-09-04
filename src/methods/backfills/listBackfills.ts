import {
	BootData,
	ListBackfillInput,
	BackfillDocument,
	InputError
} from "../../types";
import { getBackfillCollection } from "../../utils";
import { Collection } from "mongodb";

const getOneBackfill = async (
	backfillCollection: Collection,
	documentName: string
): Promise<BackfillDocument[]> => {
	try {
		const oneBackfill = await backfillCollection.findOne({
			name: documentName
		});

		return [oneBackfill];
	} catch (err) {
		throw err;
	}
};

const getAllBackfills = async (
	backfillCollection: Collection
): Promise<BackfillDocument[]> => {
	try {
		const allBackfills: BackfillDocument[] = await backfillCollection
			.find({})
			.toArray();

		return allBackfills;
	} catch (err) {
		throw err;
	}
};

const listBackfills = async (
	bootData: BootData,
	options?: ListBackfillInput
): Promise<BackfillDocument[]> => {
	try {
		const { mongoClient } = bootData;

		const backfillCollection = await getBackfillCollection(mongoClient);

		if (options && options.documentName) {
			// List one
			const oneBackfill = await getOneBackfill(
				backfillCollection,
				options.documentName
			);
			if (oneBackfill) {
				return oneBackfill;
			} else {
				throw new InputError(
					`No backfill named ${options.documentName} saved.`
				);
			}
		} else {
			// List all
			const allBackfills = await getAllBackfills(backfillCollection);

			if (allBackfills.length) {
				return allBackfills;
			} else {
				return [];
			}
		}
	} catch (err) {
		throw err;
	}
};

export default listBackfills;
