const { series } = require("gulp");

const clean = require("./clean");
const transpile = require("./transpile");
const watch = require("./watch");
const build = series(clean, transpile);

module.exports = {
	clean,
	transpile,
	watch,
	build
};
