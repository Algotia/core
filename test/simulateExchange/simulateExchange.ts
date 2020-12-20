import { assert, describe, it } from "quyz";
import ccxt, { Exchange as CCXT_Exchange, Dictionary, Market } from "ccxt";
import {
	simulateExchange,
	AllowedExchangeIDs,
	ExchangeID,
	SimulatedExchange,
} from "../../src/algotia";
import { stub } from "sinon";

interface ExchangeObj {
	originalExchange: CCXT_Exchange;
	derivedExchange: SimulatedExchange;
	exchangeId: ExchangeID;
}

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

	it("should set 'has' to 'simulated' for all methods except for derived-only methods", () => {
		const {
			loadMarkets,
			fetchStatus,
			...exchangeHas
		} = defaultExchange.has;

		for (const method in exchangeHas) {
			assert(exchangeHas[method] === "simulated");
		}
	});

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

	it("should set contain dervied 'has' values from exchange", () => {
		for (const exchangeObj of allExchangeObj) {
			const { derivedExchange, originalExchange } = exchangeObj;

			const {
				loadMarkets,
				fetchOHLCV,
				fetchOrderBook,
				fetchStatus,
				...simulatedMethods
			} = derivedExchange.has;

			for (const method in simulatedMethods) {
				assert.strictEqual(simulatedMethods[method], "simulated");
			}

			for (const method in {
				loadMarkets,
				fetchOHLCV,
				fetchOrderBook,
				fetchStatus,
			}) {
				assert.strictEqual(
					derivedExchange.has[method],
					originalExchange.has[method]
				);
			}
		}
	});

	it("should have populated properties if dervies from real exchange", async () => {
		for (const exchangeId of AllowedExchangeIDs) {
			const { exchange } = simulateExchange({
				initialBalance: {
					ETH: 100,
					BTC: 100,
				},
				derviesFrom: exchangeId,
			});

			stub(exchange, "loadMarkets").callsFake(async () => {
				const markets: unknown = {
					"BTC/ETH": {},
					"ETH/BTC": {},
				};
				exchange.markets = markets as Dictionary<Market>;

				exchange.symbols = Object.keys(markets);

				const timeframes: Dictionary<string> = {
					"1m": "1m",
					"5m": "5m",
				};
				exchange.timeframes = timeframes;

				return {};
			});

			await exchange.loadMarkets();

			assert(Object.keys(exchange.markets).length > 1);
			assert(Object.keys(exchange.timeframes).length > 1);
			assert(exchange.symbols.length > 1);
		}
	});
});
