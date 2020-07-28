import { BootData } from "../../types";
import { Collection } from "mongodb";
import { connectToDb, log } from "..";

const getBackfillCollection = async (
	bootData: BootData
): Promise<Collection> => {
	try {
		const { client } = bootData;
		const db = await connectToDb(client);

		return db.collection("backfill");
	} catch (err) {
		log.error(err);
	}
};

export default getBackfillCollection;
