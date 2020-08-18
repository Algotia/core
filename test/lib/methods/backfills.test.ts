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

			const { client } = bootData;
			const backfillCollection = await getBackfillCollection(client);

			const allBackfills = await backfills.listBackfills(bootData);

			const realLength = await backfillCollection.countDocuments();

			if (realLength) {
				expect(allBackfills.length).toStrictEqual(realLength);
			} else {
				expect(allBackfills).toStrictEqual(undefined);
			}

			await bootData.client.close();
		} catch (err) {
			log.error(err);
		}
	});
});
