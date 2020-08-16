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

			const realLength = await backfillCollection.countDocuments();
      
			if (realLength) {
				const allBackfills = await backfills.listBackfills(bootData);
				expect(allBackfills.length).toStrictEqual(realLength);
			} else {
				await expect(backfills.listBackfills(bootData)).rejects.toThrowError();
			}

			await bootData.client.close();
		} catch (err) {
			throw err;
		}
	});
});
