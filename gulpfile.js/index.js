const { series } = require("gulp");

const clean = require("./clean");
const transpile = require("./transpile");
const copyFiles = require("./copyFiles");
const generateFiles = require("./generateFiles");
const watch = require("./watch");

const build = series(clean, transpile, copyFiles, generateFiles);

module.exports = {
	clean,
	transpile,
	copyFiles,
	generateFiles,
	watch,
	build,
};
