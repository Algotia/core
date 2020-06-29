const ncp = require("ncp").ncp;
const includesWithGlob = require("array-includes-with-glob");
const { info, error } = require("./logs");

const outputPath = "./dist";
const inputPath = "./src";

function copyFiles(cb) {
	// Use double quotes for include (and this whole function to be safe) for Windows compatibility

	const filter = (file) => {
		const excludeList = ["*.md", "*.ts"];
		let relativeSliceIndex = file.indexOf("/src");
		let relativePath = "." + file.substring(relativeSliceIndex, file.length);

		if (includesWithGlob(relativePath, excludeList)) {
			return false;
		}

		return file;
	};

	const options = { filter };

	ncp(inputPath, outputPath, options, (err) => {
		if (err) {
			error("Could not copy files -- " + err);
			cb(new Error());
		}
		info("Copied files from ./src to ./dist/");
		cb();
	});
}

module.exports = copyFiles;
