import { BackfillDocument, MethodFactoryArgs } from "../../../../../types";
import { getBackfillCollection } from "../../../../../utils";

const getDataSet = async (
	args: MethodFactoryArgs
): Promise<BackfillDocument> => {
	try {
		const backfillName = await args.redisClient.get("backfillName");

		const backfillCollection = await getBackfillCollection(args.mongoClient);

		const backfilldoc = await backfillCollection.findOne({
			name: backfillName
		});
		return backfilldoc;
	} catch (err) {
		throw err;
	}
};

export default getDataSet;
