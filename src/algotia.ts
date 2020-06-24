import boot from "./boot";

(async () => {
	try {

    await boot();

	} catch (err) {
		console.log(err);
	}
})()
