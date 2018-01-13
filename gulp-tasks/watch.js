const gulp = require('gulp');
const path = require('path');
const build = require('./build');

const watch = () => {
  gulp.watch(path.posix.join(global.__buildConfig.src, '**', '*'))
    .on('change', build);
};

module.exports = watch;
