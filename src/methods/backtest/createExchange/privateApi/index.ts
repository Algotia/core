import { MethodFactoryArgs, PrivateApi } from "../../../../types";
import privateApiFactories from "./methods/";

const createPrivateApis = async (
	methodFactoryArgs: MethodFactoryArgs
): Promise<PrivateApi> => {
	try {
		let api: PrivateApi;

		for (const factoryKey in privateApiFactories) {
			if (privateApiFactories.hasOwnProperty(factoryKey)) {
				const factory = privateApiFactories[factoryKey](methodFactoryArgs);
				api = {
					...api,
					[factoryKey]: factory
				};
			}
		}

		return api;
	} catch (err) {
		throw err;
	}
};

export default createPrivateApis;
