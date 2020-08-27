import getDataSet from "./getDataSet";
import { Collections, MethodFactoryArgs } from "../../../../../types";

type StringTuple = [string, string];

const getBackfillPair = async (
	args: MethodFactoryArgs
): Promise<StringTuple> => {
	const dataSet = await getDataSet(args);
	const pair = dataSet.pair;
	const split = pair.split("/");
	return [split[0], split[1]];
};

export default getBackfillPair;
