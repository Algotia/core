import { parsePair } from "../../general";
import { ExchangeID } from "../../../types";

const getBaseAndQuotePath = (
	exchangeId: ExchangeID,
	pair: string
): [string, string] => {
	const [base, quote] = parsePair(pair);

	const basePath = `${exchangeId}-balance:${base}`;
	const quotePath = `${exchangeId}-balance:${quote}`;
	return [basePath, quotePath];
};

export default getBaseAndQuotePath;
