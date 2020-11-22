import { AssertionError } from "assert";
import chalk from "chalk";
import sinon from "sinon";
import {inspect} from "util";

let context = {
	passed: 0,
	failed: 0,
	totalRuntime: 0,
	errors: [],
};

const testManger = {
	pass: (title: string, runtime: number) => {
		// If user forgot to restore clock, do it here
		sinon.restore();

		console.log(
			chalk.green("PASSED: "),
			title,
			chalk.green(`(${runtime}ms)`)
		);

		context.passed += 1;
		context.totalRuntime += runtime;
	},
	fail: (title: string, runtime: number, error: Error) => {
		// If user forgot to restore clock, do it here
		sinon.restore();

		console.log(chalk.red("FAILED: "), title, chalk.red(`(${runtime}ms)`));

		context.failed += 1;
		context.totalRuntime += runtime;
		context.errors.push([error, title]);
	},
	get: () => {
		const { errors, ...count } = context;
		if (errors) {
			for (let i = 0; i < errors.length; i++) {
				const [error, title] = errors[i];
				console.log(
					chalk.magenta("=====================================")
				);

				console.log("\n");

				console.log(
					chalk.red.bold.underline(`Failed #${i + 1} - ${title}`)
				);

				const expected =
					typeof error.expected === "object"
						? inspect(error.expected, false, 1)
						: error.expected;

				const actual =
					typeof error.actual === "object"
						? inspect(error.actual, false, 1)
						: error.actual;

				if (error instanceof AssertionError) {
					console.log(chalk.green(`    expected: ${expected}`));
					console.log(chalk.red(`    recieved: ${actual}`));
				} else {
					console.log(error);
				}

				console.log("\n");
			}
			console.log(chalk.magenta("====================================="));
		}
		console.log(chalk.green.bold(`Passed: ${context.passed}`));
		console.log(chalk.red.bold(`Failed: ${context.failed}`));
		console.log(chalk.blue.bold(`Runtime: ${context.totalRuntime}ms`));
	},
};

export default testManger;
