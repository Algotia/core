const { src, dest } = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const { error, info } = require("./logs");

const outputPath = "./dist";
const inputPath = "./src";

function transpile() {
	try {
		info("Starting TypeScript compiler");
		return src(`${inputPath}/**/*.ts`).pipe(tsProject()).pipe(dest(outputPath));
	} catch (err) {
		error(err);
	}
}

module.exports = transpile;
