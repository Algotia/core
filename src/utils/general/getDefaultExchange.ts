import { isExchangeID, AnyAlgotia, Exchange } from "../../types/";

const getDefaultExchangeId = (algotia: AnyAlgotia): Exchange => {
	const { config, exchanges } = algotia;
	const key = Object.keys(config.exchange)[0];
	if (isExchangeID(key)) {
		return exchanges[key];
	}
};

export default getDefaultExchangeId;
