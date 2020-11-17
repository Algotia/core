import { AllowedExchangeIDs, SimulatedExchangeResult } from "../../src/types";
import { simulateExchange } from "../../src/exchange";

describe("simulateExchange", () => {
	const initialBalance = {
		ETH: 10,
		BTC: 10,
	};

	let exchanges: SimulatedExchangeResult[] = [];

	beforeAll(async () => {
		for (const exchangeID of AllowedExchangeIDs) {
			const exchange = await simulateExchange(exchangeID, initialBalance);
			exchanges.push(exchange);
		}
	});

	afterEach((done) => {
		for (const exchange of exchanges) {
			exchange.flushStore();
		}
		done();
	});

test("Market buy order fills after 1 candle", async () => {
		try {
			for (const singleExchange of exchanges) {
				const {
					exchange,
					store,
					updateContext,
					fillOrders,
				} = singleExchange;

				updateContext(1000, 9);

				const order = await exchange.createOrder(
					"ETH/BTC",
					"market",
					"buy",
					1
				);

				expect(store.closedOrders.length).toStrictEqual(0);
				expect(store.openOrders.length).toStrictEqual(1);

				expect(store.balance["BTC"].free).toStrictEqual(
					initialBalance.BTC - order.cost
				);
				expect(store.balance["BTC"].used).toStrictEqual(order.cost);

				fillOrders({
					timestamp: 1000,
					open: 10,
					high: 10,
					low: 10,
					close: 10,
					volume: 10,
				});

				expect(store.closedOrders[0].trades.length).toStrictEqual(1)

				expect(store.openOrders.length).toStrictEqual(0);
				expect(store.closedOrders.length).toStrictEqual(1);
				expect(store.balance["BTC"].free).toStrictEqual(
					initialBalance.BTC - order.cost
				);

				expect(store.balance["BTC"].used).toStrictEqual(0);
				expect(store.balance["ETH"].free).toStrictEqual(
					initialBalance.ETH + order.amount
				);
				expect(store.balance["ETH"].used).toStrictEqual(0);
			}
		} catch (err) {
			throw err;
		}
	});

	test("Market sell order fills after 1 candle", async () => {
		try {
			for (const singleExchange of exchanges) {
				const {
					exchange,
					store,
					updateContext,
					fillOrders,
				} = singleExchange;

				updateContext(1000, 9);

				const order = await exchange.createOrder(
					"ETH/BTC",
					"market",
					"sell",
					1
				);

				expect(store.closedOrders.length).toStrictEqual(0);
				expect(store.openOrders.length).toStrictEqual(1);

				expect(store.balance["ETH"].free).toStrictEqual(
					initialBalance.ETH - order.amount
				);
				expect(store.balance["ETH"].used).toStrictEqual(order.amount);

				fillOrders({
					timestamp: 1000,
					open: 8,
					high: 8,
					low: 8,
					close: 8,
					volume: 8,
				});

				expect(store.openOrders.length).toStrictEqual(0);
				expect(store.closedOrders.length).toStrictEqual(1);

				expect(store.closedOrders[0].trades.length).toStrictEqual(1)

				expect(store.balance["ETH"].free).toStrictEqual(
					initialBalance.ETH - order.amount
				);

				expect(store.balance["ETH"].used).toStrictEqual(0);

				expect(store.balance["BTC"].free).toStrictEqual(
					initialBalance.BTC + store.closedOrders[0].trades[0].cost
				);
				expect(store.balance["BTC"].used).toStrictEqual(0);
			}
		} catch (err) {
			throw err
		}
	})

	test("Limit order buy fills on second candle", async () => {
		try {
			for (const singleExchange of exchanges) {
				const {
					exchange,
					store,
					updateContext,
					fillOrders,
				} = singleExchange;

				updateContext(1000, 10);

				const order = await exchange.createOrder(
					"ETH/BTC",
					"limit",
					"buy",
					1,
					5
				);

				expect(store.closedOrders.length).toStrictEqual(0);
				expect(store.openOrders.length).toStrictEqual(1);
				expect(store.balance["BTC"].free).toStrictEqual(
					initialBalance.BTC - order.cost
				);

				fillOrders({
					timestamp: 1000,
					open: 10,
					high: 10,
					low: 10,
					close: 10,
					volume: 10,
				});

				expect(store.openOrders.length).toStrictEqual(1);
				expect(store.closedOrders.length).toStrictEqual(0);
				expect(store.openOrders[0].status).toStrictEqual("open");

				updateContext(2000, 10);
				fillOrders({
					timestamp: 2000,
					open: 10,
					high: 10,
					low: 4,
					close: 10,
					volume: 10,
				});

				expect(store.openOrders.length).toStrictEqual(0);
				expect(store.closedOrders.length).toStrictEqual(1);

				expect(store.balance["BTC"].free).toStrictEqual(
					initialBalance.BTC - order.cost
				);
				expect(store.balance["BTC"].used).toStrictEqual(0);
				expect(store.balance["ETH"].free).toStrictEqual(
					initialBalance.ETH + order.amount
				);

				const closedOrder = store.closedOrders[0];
				expect(closedOrder.lastTradeTimestamp).toStrictEqual(2000);
				expect(closedOrder.average).toStrictEqual(5);
				expect(closedOrder.status).toStrictEqual("closed");
			}
		} catch (err) {
			throw err;
		}
	});

	test("Create order throws on non-existent pair", async () => {
		try {
			for (const singleExchange of exchanges) {
				const { updateContext, exchange, store } = singleExchange;

				updateContext(1000, 10);

				const order = await exchange.createOrder(
					"DOESNT/EXIST",
					"market",
					"buy",
					1
				);

				expect(order).toStrictEqual(undefined);

				expect(store.errors.length).toStrictEqual(1);
			}
		} catch (err) {
			throw err;
		}
	});

});
