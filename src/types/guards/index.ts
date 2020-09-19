import { AllowedExchangeId, AllowedExchanges } from "../shared";
import { SingleCandleSet, MultiCandleSets } from "../methods";

const isAllowedExchangeId = (str: string): str is AllowedExchangeId => {
	const casted = str as AllowedExchangeId;
	if (AllowedExchanges.includes(casted)) return true;
	return false;
};

const isSingleCandleSet = (
	candleSet: SingleCandleSet | MultiCandleSets
): candleSet is SingleCandleSet => {
	return (candleSet as SingleCandleSet).length !== undefined;
};
export { isAllowedExchangeId, isSingleCandleSet };
