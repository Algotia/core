const rimraf = require('rimraf');
const fs = require('fs');
const { info, error } = require('./logs');

const outputPath = './dist';
const inputPath = './src';

function clean(cb){

    const deleteDist = () => {
        rimraf(outputPath, (err)=>{
            if (err) error('Error deleting ./dist folder :', err);
        })
        info('Deleted dist folder')
    }

    if (fs.existsSync(outputPath)) deleteDist()

    cb();
};

module.exports = clean;
