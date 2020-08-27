import { ActiveBacktestDocumentWithId, Collections } from "../../../types";
import { convertPeriodToMs } from "../../../utils";
import fillOrder from "./fillOrder";

const reconcile = async (collections: Collections) => {
	try {
		const backtest: ActiveBacktestDocumentWithId = await collections.backtest.findOne(
			{ active: true }
		);
		const { backfillId, internalCandleIdx, orders } = backtest;
		const backfill = await collections.backfill.findOne({ _id: backfillId });

		const oneMinMs = 60000;
		const { internalCandles } = backfill;
		const { period } = backfill;

		const periodMs = convertPeriodToMs(period);

		const timesToReconcile = Math.floor(periodMs / oneMinMs);

		let internalCandleCursor = internalCandleIdx;

		for (let i = 0; i < timesToReconcile; i++) {
			const internalCandle = internalCandles[internalCandleCursor];
			const { open, close } = internalCandle;
			internalCandleCursor++;
			orders
				.filter((order) => {
					return order.status === "open";
				})
				.forEach(async (order) => {
					const { side, price } = order;
					if (side === "buy") {
						// BUY
						if (price >= open || price >= close) {
							await fillOrder(order, collections);
						}
					} else {
						// SELL

						if (price <= open || price <= close) {
							await fillOrder(order, collections);
						}
					}
				});
		}
	} catch (err) {
		throw err;
	}
};

export default reconcile;
