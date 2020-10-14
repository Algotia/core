import { ExchangeRecord, AllowedExchanges } from "../index";

const isExchangeRecord = <T>(obj: any): obj is ExchangeRecord<T> => {
	const objKeys = Object.keys(obj);
	if (objKeys && objKeys.length) {
		return objKeys.reduce((a, b: any) => {
			return AllowedExchanges.includes(b);
		}, false);
	}
};

export default isExchangeRecord;
