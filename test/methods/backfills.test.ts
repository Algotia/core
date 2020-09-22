import { backfill, boot, BootData } from "../../src/algotia";
import { getBackfillCollection } from "../../src/utils";

describe("Backfills", () => {
	let bootData: BootData;
	beforeAll(async () => {
		bootData = await boot({
			exchange: {
				binance: true
			}
		});
	});
	afterAll(async () => {
		bootData.quit();
	});
	test("List All", async () => {
		try {
			const { mongoClient } = bootData;
			const backfillCollection = await getBackfillCollection(mongoClient);

			const realLength = await backfillCollection.countDocuments();

			const allBackfills = await backfill.list(bootData);
			expect(allBackfills.length).toStrictEqual(realLength);
		} catch (err) {
			throw err;
		}
	});
});
