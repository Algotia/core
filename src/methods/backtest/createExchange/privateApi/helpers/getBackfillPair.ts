import getDataSet from "./getDataSet";
import { Collections } from "../../../../../types";

type StringTuple = [string, string];

const getBackfillPair = async (
	collections: Collections
): Promise<StringTuple> => {
	const dataSet = await getDataSet(collections);
	const pair = dataSet.pair;
	const split = pair.split("/");
	return [split[0], split[1]];
};

export default getBackfillPair;
