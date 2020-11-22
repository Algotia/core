import getDefaultOptionsTests from "./getDefaultOptions";
import roundTimeTests from "./roundTime";

const utilsTests = async () => {
	await getDefaultOptionsTests();
	await roundTimeTests();
};

export default utilsTests;
