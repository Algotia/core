import { ExchangeID, AllowedExchanges } from "../shared";

const isExchangeID = (id: any): id is ExchangeID => {
	return AllowedExchanges.includes(id);
};

export default isExchangeID;
