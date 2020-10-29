import { AnyAlgotia, ExchangeID } from "../../../types";

const createPricePath = (exchangeId: ExchangeID, pair: string): string => {
	return `${exchangeId}-current-price:${pair}`;
};

const getCurrentPrice = async (
	algotia: AnyAlgotia,
	exchangeId: ExchangeID,
	pair: string
): Promise<number> => {
	try {
		const path = createPricePath(exchangeId, pair);
		const price = await algotia.redis.get(path);
		return parseFloat(price);
	} catch (err) {
		throw err;
	}
};

const setCurrentPrice = async (
	algotia: AnyAlgotia,
	exchangeId: ExchangeID,
	pair: string,
	price: number
): Promise<void> => {
	try {
		const path = createPricePath(exchangeId, pair);
		await algotia.redis.set(path, price);
	} catch (err) {
		throw err;
	}
};

export { getCurrentPrice, setCurrentPrice };
