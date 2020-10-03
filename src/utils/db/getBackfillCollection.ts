import { Db, Collection } from "mongodb";

const getBackfillCollection = (db: Db): Collection => {
	return db.collection("backfill");
};

export default getBackfillCollection;
