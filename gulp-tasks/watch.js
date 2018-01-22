const gulp = require('gulp');
const path = require('path');
const build = require('./build');

const watch = () => {
  gulp.watch(path.posix.join(global.__buildConfig.src, '**', '*'))
    .on('change', gulp.parallel([
      'copy',
      'css',
      'html',
      'images',
      'scripts',
      'handlebars',
    ]));
};

module.exports = watch;
