import getDefaultOptionsTests from "./getDefaultOptions";
import roundTimeTests from "./roundTime";
import { describe } from "petzl";

const utilsTests = () => {
	describe("Utils", () => {
		getDefaultOptionsTests();
		roundTimeTests();
	});
};

export default utilsTests;
