import {SimulatedExchangeStore} from "../../../../types";

const createUpdateContext = (store: SimulatedExchangeStore) => {
	return (time: number, price: number) => {
		store.currentTime = time;
		store.currentPrice = price;
	};
}

export default createUpdateContext

