import dotenv from "dotenv";
import boot from "./boot";
import createCli from "./lib/cli"

(async () => {
	try {
		const bootData = await boot();
    createCli(bootData)

	} catch (err) {
		console.log(err);
	}
})();
