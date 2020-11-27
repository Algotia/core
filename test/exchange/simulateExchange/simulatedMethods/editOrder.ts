import { SimulatedExchangeResult } from "../../../../src/types";
import { isCloseTo } from "../../../testUtils";
import { describe, it } from "petzl";
import assert from "assert";

const editOrderTests = async (
	singleExchange: SimulatedExchangeResult,
	initialBalance: Record<string, number>
) => {
	await describe("edit order", async () => {
		await it(`should edit market order if not filled`, async () => {
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

			const editedOrder = await exchange.editOrder(
				order.id,
				"ETH/BTC",
				"market",
				"buy",
				0.5
			);

			assert.strictEqual(store.closedOrders.length, 0);
			assert.strictEqual(store.openOrders.length, 1);
			assert.strictEqual(store.openOrders[0].amount, 0.5);
			assert(
				isCloseTo(
					store.balance["BTC"].free,
					initialBalance.BTC - editedOrder.cost - order.fee.cost
				)
			);
			assert.strictEqual(store.balance["BTC"].used, editedOrder.cost);

			fillOrders({
				timestamp: 1000,
				open: 10,
				high: 10,
				low: 10,
				close: 10,
				volume: 10,
			});

			assert.strictEqual(store.openOrders.length, 0);
			assert.strictEqual(store.closedOrders.length, 1);

			assert.strictEqual(
				store.balance.ETH.free,
				initialBalance.ETH + editedOrder.amount
			);
			assert.strictEqual(store.balance.BTC.used, 0);
			singleExchange.flushStore();
		});
	});
};

export default editOrderTests;
