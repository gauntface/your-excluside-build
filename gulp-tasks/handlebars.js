const gulp = require('gulp');
const mustache = require('gulp-mustache');
const htmlmin = require('gulp-htmlmin');

const handlebars = () => {
  return gulp.src(`${global.__buildConfig.src}/**/*.hbs`)
  .pipe(mustache({}, {
    extension: '.html',
  }))
  .pipe(htmlmin({
    html5: true,
    collapseWhitespace: true,
    removeComments: true,
    removeEmptyAttributes: true,
    sortAttributes: true,
    sortClassName: true,
  }))
  .pipe(gulp.dest(global.__buildConfig.dest));
};

gulp.task(handlebars);
