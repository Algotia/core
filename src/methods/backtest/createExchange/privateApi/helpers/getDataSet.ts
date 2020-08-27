import {
	BackfillDocument,
	ActiveBacktestDocument,
	Collections,
	MethodFactoryArgs
} from "../../../../../types";

const getDataSet = async (
	args: MethodFactoryArgs
): Promise<BackfillDocument> => {
	try {
		const backfillId = await args.redisClient.get("backfillId");

		const backfilldoc = await args.collections.backfill.findOne({
			name: backfillId
		});
		return backfilldoc;
	} catch (err) {
		throw err;
	}
};

export default getDataSet;
