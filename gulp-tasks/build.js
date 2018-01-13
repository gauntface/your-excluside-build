const gulp = require('gulp');
const fse = require('fs-extra');

const build = (done) => {
  return gulp.series([
    () => fse.remove(global.__buildConfig.dest),
    gulp.parallel([
      'copy',
      'css',
      'html',
      'images',
      'scripts',
      // 'gallery',
      'handlebars',
    ]),
    'serviceWorker',
  ])(done);
};

module.exports = build;
