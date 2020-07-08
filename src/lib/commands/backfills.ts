import { MongoClient } from "mongodb";
import log from "fancy-log";
import chalk from "chalk";
import inquirer from "inquirer";
import { ListOptions, DeleteOptions } from "../../types/index";
import { bail, log as logger } from "../../utils/index";

const { success, info } = logger;

// Utility functions
const connect = async () => {
	try {
		const dbUrl = "mongodb://localhost:27017";
		const dbName = "algotia";
		const dbOptions = {
			useUnifiedTopology: true
		};
		const client = new MongoClient(dbUrl, dbOptions);

		await client.connect();

		const db = client.db(dbName);

		const backfillCollection = db.collection("backfill");

		return { backfillCollection, client };
	} catch (err) {
		return Promise.reject(new Error(err));
	}
};

// Format metadata for console.table
function BackfillRow(data) {
	function format(str: string) {
		const num = parseInt(str, 10);
		return new Date(num).toLocaleString();
	}
	const { documentName, period, pair, since, until } = data;
	this.document_name = documentName;
	this.records = data.records.length;
	this.period = period;
	this.pair = pair;
	this["since (formatted)"] = format(since);
	this["until (formatted)"] = format(until);
}

const confirmDangerous = async (documentsAffected?: number) => {
	try {
		const question = [
			{
				type: "confirm",
				name: "proceedDangerous",
				message: `The following operation affects ${documentsAffected} ${
					documentsAffected > 1 ? "documents" : "document"
				} and is destructive. Continue?`,
				default: false
			}
		];
		const answer = await inquirer.prompt(question);

		return answer;
	} catch (err) {
		return Promise.reject(new Error(err));
	}
};

// End utility functions

const listOne = async (documentName: string, options: ListOptions) => {
	try {
		const { client, backfillCollection } = await connect();
		const { pretty } = options;
		const oneBackfill = await backfillCollection.find({ documentName: documentName }).toArray();

		if (oneBackfill.length !== 0) {
			if (pretty) {
				console.table([new BackfillRow(oneBackfill[0])]);
			} else {
				log(oneBackfill[0]);
			}
		} else {
			log.error(
				`No backfill named ${documentName} saved. Run ${chalk.bold.underline(
					"algotia backfills list"
				)} to see saved documents.`
			);
		}
		await client.close();
	} catch (err) {
		return Promise.reject(new Error(err));
	}
};

const listAll = async (options: ListOptions) => {
	try {
		const { pretty } = options;
		const { client, backfillCollection } = await connect();
		const allBackfills = backfillCollection.find({});
		const backfillsArr = await allBackfills.toArray();

		if (backfillsArr.length) {
			let allDocs = [];

			backfillsArr.forEach((doc) => {
				allDocs.push(new BackfillRow(doc));
			});
			if (pretty) {
				console.table(allDocs);
			} else {
				log(allDocs);
			}
		} else {
			log(`No backfills saved. Run ${chalk.bold.underline("algotia backfill -h")} for help.`);
		}

		await client.close();
		process.exit(0);
	} catch (err) {
		return Promise.reject(new Error(err));
	}
};

const deleteAll = async (options: DeleteOptions) => {
	try {
		const { client, backfillCollection } = await connect();
		const { verbose } = options;
		const allBackfills = backfillCollection.find({});
		const backfillsArr = await allBackfills.toArray();
		const { length } = backfillsArr;
		if (length) {
			const proceed = await confirmDangerous(length);
			if (proceed && verbose) {
				info("Deleting the following documents:");
				backfillsArr.forEach((doc) => {
					console.log("     " + doc.documentName);
				});
				await backfillCollection.drop();
				success(`Deleted ${length} ${length > 1 ? "documents" : "document"} from the database.`);
			} else {
				bail(`Bailed out of deleting ${length} documents`);
			}
		}

		await client.close();
	} catch (err) {
		return Promise.reject(new Error(err));
	}
};

const deleteOne = async (documentName: string, options: DeleteOptions) => {
	try {
		const { client, backfillCollection } = await connect();
		const { verbose } = options;
		const oneBackfill = backfillCollection.find({ name: documentName });
		const backfillsArr = await oneBackfill.toArray();
		const { length } = backfillsArr;
		if (length) {
			const proceed = await confirmDangerous(length);
			if (proceed) {
				if (verbose) info(`Deleting ${documentName}`);
				await backfillCollection.deleteOne({ name: documentName });
				success(`Deleted document ${documentName} from the database.`);
			} else {
				bail(`Bailed out of deleting document ${documentName}`);
			}
		} else {
			bail(`No documents name ${documentName}.`);
		}

		await client.close();
	} catch (err) {
		return Promise.reject(new Error(err));
	}
};

const backfills = {
	listOne,
	listAll,
	deleteAll,
	deleteOne
};

export default backfills;
