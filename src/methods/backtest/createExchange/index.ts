import createPublicApis from "./publicApi/";
import createPrivateApis from "./privateApi/";
import { BacktestingExchange, MethodFactoryArgs } from "../../../types";

const createBacktestingExchange = async (
	methodFactoryArgs: MethodFactoryArgs
): Promise<BacktestingExchange> => {
	const { exchange } = methodFactoryArgs;
	const publicApis = createPublicApis(exchange);

	const privateApis = await createPrivateApis(methodFactoryArgs);

	const backtestExchange = {
		...publicApis,
		...privateApis
	};

	return backtestExchange;
};

export default createBacktestingExchange;
