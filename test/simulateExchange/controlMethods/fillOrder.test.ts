import { OHLCV, SimulatedExchangeStore } from "../../../src/types";
import { parsePair } from "../../../src/utils";
import { simulatedExchange, initialBalance, reset } from "../../test-utils";

const orderTypes = ["market", "limit"] as const;
const orderSides = ["buy", "sell"] as const;
const symbol = "ETH/BTC";
const [base, quote] = parsePair(symbol);

const checkAfterBalance = (store: SimulatedExchangeStore) => {
	const trade = store.closedOrders[0].trades[0];

	const side = trade.side;

	const feeCost = trade.fee.cost;
	const totalCost = trade.cost + feeCost;
	const costLessFee = trade.cost - trade.fee.cost;

	if (side === "buy") {
		expect(store.balance[quote]).toStrictEqual({
			free: initialBalance[quote] - totalCost,
			used: 0,
			total: initialBalance[quote] - totalCost,
		});
	}
	if (side === "sell") {
		expect(store.balance[base]).toStrictEqual({
			free: initialBalance[base] - trade.amount,
			used: 0,
			total: initialBalance[base] - trade.amount,
		});
		expect(store.balance[quote]).toStrictEqual({
			free: initialBalance[quote] + costLessFee,
			used: 0,
			total: initialBalance[base] + costLessFee,
		});
	}
};

describe("fillOrders", () => {
	afterEach(() => {
		reset();
	});

	for (const type of orderTypes) {
		for (const side of orderSides) {
			it(`Should fill ${type} ${side} order`, async () => {
				const {
					exchange,
					updateContext,
					store,
					fillOrders,
				} = simulatedExchange;

				const candle = {
					timestamp: 100,
					open: 5,
					high: 5,
					low: 5,
					close: 5,
					volume: 1,
				};

				updateContext(candle.timestamp, candle.close);

				expect(store.openOrders.length).toStrictEqual(0);
				expect(store.closedOrders.length).toStrictEqual(0);

				await exchange.createOrder(symbol, type, side, 1, 5);

				fillOrders(candle);

				expect(store.closedOrders.length).toStrictEqual(1);
				expect(store.closedOrders[0].trades.length).toStrictEqual(1);

				checkAfterBalance(store);
			});
		}
	}
	for (const side of orderSides) {
		it(`Should fill limit ${side} order after 1 candle`, async () => {
			let firstCandle: OHLCV;
			let secondCandle: OHLCV;
			if (side === "buy") {
				firstCandle = {
					timestamp: 1000,
					open: 11,
					high: 11,
					low: 11,
					close: 11,
					volume: 1,
				};
			}

			if (side === "sell") {
				firstCandle = {
					timestamp: 1000,
					open: 9,
					high: 9,
					low: 9,
					close: 9,
					volume: 1,
				};
			}

			const targetPrice = 10;

			const secondCandleKey =
				(side === "buy" && "low") || (side === "sell" && "high");

			secondCandle = {
				...firstCandle,
				timestamp: 2000,
				[secondCandleKey]: targetPrice,
			};
			const {
				exchange,
				updateContext,
				store,
				fillOrders,
			} = simulatedExchange;

			updateContext(firstCandle.timestamp, firstCandle.close);

			expect(store.openOrders.length).toStrictEqual(0);
			expect(store.closedOrders.length).toStrictEqual(0);

			await exchange.createOrder(symbol, "limit", side, 1, 10);

			fillOrders(firstCandle);

			expect(store.openOrders.length).toStrictEqual(1);
			expect(store.closedOrders.length).toStrictEqual(0);

			fillOrders(secondCandle);

			expect(store.openOrders.length).toStrictEqual(0);
			expect(store.closedOrders.length).toStrictEqual(1);
			expect(store.closedOrders[0].trades.length).toStrictEqual(1);

			checkAfterBalance(store);
		});
	}
});
