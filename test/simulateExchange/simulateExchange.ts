import { assert, describe, it } from "quyz";
import ccxt, { Exchange as CCXT_Exchange } from "ccxt";
import {
	simulateExchange,
	AllowedExchangeIDs,
	ExchangeID,
	SimulatedExchange,
} from "../../src/algotia";

describe("simulateExchange", () => {
	const { exchange: defaultExchange } = simulateExchange({
		initialBalance: {
			ETH: 100,
			BTC: 100,
		},
	});

	it("should not be derived from any exchange", () => {
		assert(defaultExchange.derviesFrom === undefined);
		assert(defaultExchange.has.loadMarkets === false);
	});

	it("should set 'has' to 'simulated' for all methods except loadMarkets", () => {
		const { loadMarkets, ...exchangeHas } = defaultExchange.has;

		for (const method in exchangeHas) {
			assert(exchangeHas[method] === "simulated");
		}
	});

	interface ExchangeObj {
		originalExchange: CCXT_Exchange;
		derivedExchange: SimulatedExchange;
		exchangeId: ExchangeID;
	}

	const allExchangeObj: ExchangeObj[] = AllowedExchangeIDs.map(
		(exchangeId) => {
			const { exchange: derivedExchange } = simulateExchange({
				derviesFrom: exchangeId,
				initialBalance: {
					ETH: 100,
					BTC: 100,
				},
			});

			return {
				originalExchange: new ccxt[exchangeId](),
				derivedExchange,
				exchangeId,
			};
		}
	);

	it(`should derive from a real exchange`, () => {
		for (const exchangeObj of allExchangeObj) {
			const {
				exchangeId,
				derivedExchange,
				originalExchange,
			} = exchangeObj;
			assert.strictEqual(derivedExchange.derviesFrom, exchangeId);
			assert.strictEqual(
				derivedExchange.has.loadMarkets,
				originalExchange.has.loadMarkets
			);
			assert.deepStrictEqual(derivedExchange.fees, originalExchange.fees);
		}
	});

	it("should set properties of 'has' to 'simulated' or the derived value from exchange", () => {
		for (const exchangeObj of allExchangeObj) {
			const { derivedExchange, originalExchange } = exchangeObj;

			const {
				loadMarkets,
				fetchOHLCV,
				fetchOrderBook,
				...simulatedMethods
			} = derivedExchange.has;

			for (const method in simulatedMethods) {
				assert.strictEqual(simulatedMethods[method], "simulated");
			}

			for (const method in { loadMarkets, fetchOHLCV, fetchOrderBook }) {
				assert.strictEqual(
					derivedExchange.has[method],
					originalExchange.has[method]
				);
			}
		}
	});

	it("should have populated 'markets' and 'symbols' property if dervies from real exchange", async () => {
		for (const exchangeId of AllowedExchangeIDs) {
			const { exchange } = simulateExchange({
				initialBalance: {
					ETH: 100,
					BTC: 100,
				},
				derviesFrom: exchangeId,
			});

			await exchange.loadMarkets();

			assert(Object.keys(exchange.markets).length > 1);
			assert(exchange.symbols.length > 1);
		}
	});
});
