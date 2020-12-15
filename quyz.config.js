module.exports = {
	printFileNames: false,
	collector: {
		use: "entryPoint",
		root: "test",
	},
	require: ["ts-node/register"],
};
