import { BackfillDocument, MethodFactoryArgs } from "../../../../../types";

const getDataSet = async (
	args: MethodFactoryArgs
): Promise<BackfillDocument> => {
	try {
		const backfillName = await args.redisClient.get("backfillName");

		const backfilldoc = await args.collections.backfill.findOne({
			name: backfillName
		});
		return backfilldoc;
	} catch (err) {
		throw err;
	}
};

export default getDataSet;
