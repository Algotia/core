import ccxt, { Exchange as CCXT_Exchange, Dictionary, Market } from "ccxt";
import {
	simulateExchange,
	AllowedExchangeIDs,
	ExchangeID,
	SimulatedExchange,
	createExchange,
} from "../../src/algotia";

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

	test("should not be derived from any exchange", () => {
		expect(defaultExchange.derviesFrom).toBeUndefined();
		expect(defaultExchange.has.loadMarkets).toStrictEqual(false);
	});

	test("should set 'has' to 'simulated' for all methods except for derived-only methods", () => {
		const {
			loadMarkets,
			fetchStatus,
			fetchCurrencies,
			...exchangeHas
		} = defaultExchange.has;

		for (const method in exchangeHas) {
			expect(exchangeHas[method]).toStrictEqual("simulated");
		}
	});

	const allExchangeObj: ExchangeObj[] = AllowedExchangeIDs.map(
		(exchangeId) => {
			const exchange = createExchange(exchangeId);
			const { exchange: derivedExchange } = simulateExchange({
				derviesFrom: exchange,
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

	test(`should derive from a real exchange`, () => {
		for (const exchangeObj of allExchangeObj) {
			const {
				exchangeId,
				derivedExchange,
				originalExchange,
			} = exchangeObj;
			expect(derivedExchange.derviesFrom).toStrictEqual(exchangeId);
			expect(derivedExchange.has.loadMarkets).toStrictEqual(
				originalExchange.has.loadMarkets
			);
			expect(derivedExchange.fees).toStrictEqual(originalExchange.fees);
		}
	});

	test("should set contain dervied 'has' values from exchange", () => {
		for (const exchangeObj of allExchangeObj) {
			const { derivedExchange, originalExchange } = exchangeObj;

			const {
				loadMarkets,
				fetchOHLCV,
				fetchOrderBook,
				fetchStatus,
				fetchCurrencies,
				...simulatedMethods
			} = derivedExchange.has;

			for (const method in simulatedMethods) {
				expect(simulatedMethods[method]).toStrictEqual("simulated");
			}

			for (const method of [
				"loadMarkets",
				"fetchOHLCV",
				"fetchOrderBook",
				"fetchStatus",
				"fetchCurrencies",
			]) {
				expect(derivedExchange.has[method]).toStrictEqual(
					originalExchange.has[method]
				);
			}
		}
	});

	it("should have populated properties if dervies from real exchange", async () => {
		for (const exchangeId of AllowedExchangeIDs) {
			const realExchange = createExchange(exchangeId);

			const markets: any = {
				"BTC/ETH": {},
				"ETH/BTC": {},
			};

			const currencies: any = { ETH: {}, BTC: {} };
			const loadMarketsSpy = jest
				.spyOn(realExchange, "loadMarkets")
				.mockImplementation(async () => {
					realExchange.markets = markets as Dictionary<Market>;
					realExchange.symbols = Object.keys(markets);
					realExchange.currencies = currencies;
					return markets;
				});

			const { exchange } = simulateExchange({
				initialBalance: {
					ETH: 100,
					BTC: 100,
				},
				derviesFrom: realExchange,
			});

			await exchange.loadMarkets();

			expect(loadMarketsSpy).toHaveBeenCalledTimes(1);

			expect(exchange.markets).toStrictEqual(markets);

			expect(exchange.currencies).toStrictEqual(currencies);

			expect(exchange.symbols).toStrictEqual(
				Object.keys(exchange.markets)
			);
		}
	});
});
