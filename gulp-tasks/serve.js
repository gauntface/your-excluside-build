const gulp = require('gulp');
const path = require('path');
const browserSync = require('browser-sync').create();
const watch = require('./watch.js');

const serve = () => {
  browserSync.init({
    server: global.__buildConfig.dest,
  });

  gulp.watch(path.posix.join(global.__buildConfig.dest, '**', '*'))
    .on('change', browserSync.reload);
};

gulp.task('serve', gulp.series(
  'build',
  gulp.parallel(watch, serve),
));
