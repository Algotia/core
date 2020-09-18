import { SingleExchange, MultipleExchanges } from "../../../types";

const isMultiExchange = (
	exchange: SingleExchange | MultipleExchanges
): exchange is MultipleExchanges => {
	return (exchange as MultipleExchanges).length !== undefined;
};

export default isMultiExchange;
