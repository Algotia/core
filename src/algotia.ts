import boot from "./boot";
import getConfig from "./lib/getConfig";
import createCli from "./lib/cli";

(async () => {
	try {
		const config = getConfig();
		const bootData = await boot(config);
		createCli(bootData);
	} catch (err) {
		console.log(err);
	}
})();
