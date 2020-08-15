import { BootData } from "../../types";
import { Collection } from "mongodb";
import connectToDb from "./connectToDb";

const getBackfillCollection = async (
	bootData: BootData
): Promise<Collection> => {
	try {
		const { client } = bootData;
		const db = await connectToDb(client);

		return db.collection("backfill");
	} catch (err) {
		throw err;
	}
};

export default getBackfillCollection;
