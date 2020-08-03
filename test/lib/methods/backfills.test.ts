import { backfills, boot } from "../../../src/algotia";
import { log, getBackfillCollection } from "../../../src/utils";

describe("Backfills", () => {
	test("List All", async () => {
		try {
			const bootData = await boot({
				exchange: {
					exchangeId: "bitfinex",
					apiKey: "badString",
					apiSecret: "secree",
					timeout: 8000
				}
			});

			const backfillCollection = await getBackfillCollection(bootData);

			const allBackfills = await backfills.listBackfills(bootData);

			const realLength = await backfillCollection.countDocuments();
			expect(allBackfills.length).toStrictEqual(realLength);

			await bootData.client.close();
		} catch (err) {
			log.error(err);
		}
	});
});
