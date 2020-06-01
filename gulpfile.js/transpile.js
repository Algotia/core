const { src, pipe, dest} = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const fs = require('fs');
const {error, info} = require('./logs');

const outputPath = './dist';
const inputPath = './src';

function transpile(){
    info("Starting TypeScript compiler");
    return src(`${inputPath}/**/*.ts`)
        .pipe(tsProject())
        .pipe(dest(outputPath));
};

module.exports = transpile;
