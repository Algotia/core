import { Order, Trade } from "ccxt";
import getThisCandle from "./getThisCandle";
import { Collections } from "../../../../../types";
import { v4 as uuid } from "uuid";

const fillOrder = async (collections: Collections, order: Order) => {
	const thisCandle = await getThisCandle(collections);

	const trade = {
		info: {},
		id: uuid(),
		timestamp: thisCandle.timestamp
	};
};

export default fillOrder;
