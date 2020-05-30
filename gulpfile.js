const { series, src, dest, pipe } = require('gulp');
const { exec } = require('child_process')
const fs = require('fs');
const rimraf = require('rimraf');
const ts = require('gulp-typescript');
const ncp = require('ncp').ncp;
const includesWithGlob = require('array-includes-with-glob');

const outputPath = './dist';
const inputPath = './src';
const tsProject = ts.createProject('tsconfig.json')

function clean(cb){

    const deleteDist = () => {
        rimraf(outputPath, (err)=>{
            if (err){
                console.log('Error deleting ./dist folder :', err);
            }
        })
        console.log('Deleted dist folder')
    }

    if (fs.existsSync(outputPath)) deleteDist()

    cb();
};

function transpile(){

    !fs.existsSync(outputPath) && fs.mkdirSync(outputPath);
    
    return src(`${inputPath}/**/*.ts`)
        .pipe(tsProject())
        .pipe(dest(outputPath));
};

function copyFiles(cb){
    // Use double quotes for include (and this whole function to be safe) for Windows compatibility

    
    const filter = (file) => {
        
        const excludeList = [
            "*.md",
            "*.ts"
        ];
        let relativeSliceIndex = file.indexOf("/src");
        let relativePath = "." + file.substring(relativeSliceIndex, file.length);
        
        if (includesWithGlob(relativePath, excludeList)){
            console.log('NOT COPYING -- ', relativePath)
            return false;
        }

        return file;
    }

    const options = {
        filter,

    }
    ncp(inputPath, outputPath, options, (err) => {
        if (err) {
          cb(new Error());
        }
        cb();
    });

};

function generateFiles(cb){
    //TODO: Change this over to the programmatic API
    exec(' npx typescript-json-schema ./src/config/configInterface.ts Config --out ./src/config/configSchema.json', (err, stdout, stderr)=>{
        if (err){ 
            console.log("HELLO")
            cb(new Error('Error generating JSON Schema from Typescript interface.'));
        };
    });
    cb();
}

const build = series(clean, generateFiles, copyFiles, transpile);

module.exports = {
    clean,
    transpile,
    copyFiles,
    generateFiles,
    build
}