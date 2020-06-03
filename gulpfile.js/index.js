const { series } = require('gulp');

const clean = require('./clean');
const transpile = require('./transpile');
const copyFiles = require('./copyFiles');
const generateFiles = require('./generateFiles');

const build = series(clean, transpile, copyFiles, generateFiles);

module.exports = {
    clean,
    transpile,
    copyFiles,
    generateFiles,
    build,
}
