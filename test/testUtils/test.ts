import { performance } from "perf_hooks";
import testManger from "./testManager";

type Test<T extends any[]> = (...args: T) => Promise<void>;

interface TestFunc {
	<T extends any[]>(title: string, cb: Test<T>, ...args: T): Promise<void>;
	before: () => Promise<void> | void;
}
const test: TestFunc = async <T extends any[]>(
	title: string,
	cb: Test<T>,
	...args: T
): Promise<void> => {
	let startTime: number;
	let endTime: number;

	const calcRunTime = () => Math.round(endTime - startTime);

	try {
		startTime = performance.now();
		// Run test
		await test.before();

		await cb(...args);

		endTime = performance.now();
		testManger.pass(title, calcRunTime());
	} catch (err) {
		endTime = performance.now();
		testManger.fail(title, calcRunTime(), err);
	}
};

test.before = () => {};

export default test;
