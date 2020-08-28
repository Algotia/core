import { backfills, boot, BootData } from "../../../src/algotia";
import { getBackfillCollection } from "../../../src/utils";

describe("Backfills", () => {
	let bootData: BootData;
	beforeAll(async () => {
		bootData = await boot({
			exchange: {
				exchangeId: "binance",
				timeout: 8000
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

			const allBackfills = await backfills.listBackfills(bootData);
			expect(allBackfills.length).toStrictEqual(realLength);
		} catch (err) {
			throw err;
		}
	});
});
