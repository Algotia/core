import { boot } from "../../src/algotia";
import { Config } from "../../src/types/";

describe("Boot method", () => {
	test("Fails with bad config", async () => {
		try {
			const badConfig = {
				exchange: {
					notAnExchange: true,
				},
			} as any;

			await boot(badConfig);
		} catch (err) {
			expect(err).toBeInstanceOf(Error);
		}
	});

	test("Fails with bad credentials", async () => {
		try {
			const badCredentials: Config = {
				exchange: {
					binance: {
						apiKey: 10,
					},
				},
			} as any;
			await boot(badCredentials);
		} catch (err) {
			expect(err).toBeInstanceOf(Error);
		}
	});

	test("Works", async () => {
		const algotia = await boot({
			exchange: {
				binance: true,
			},
		});
		algotia.quit();
	});
});
