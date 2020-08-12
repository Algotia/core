import { BootData } from "../../types";
import { Collection } from "mongodb";
import { log } from "..";

const getBackfillCollection = async (
	bootData: BootData
): Promise<Collection> => {
	try {
		const { client } = bootData;
		const db = client.db();

		return db.collection("backfill");
	} catch (err) {
		log.error(err);
	}
};

export default getBackfillCollection;
