const gulp = require('gulp');
const path = require('path');
const htmlmin = require('gulp-htmlmin');

gulp.task('html', () => {
  return gulp.src(path.posix.join(__dirname, '..', 'src', '**', '*.html'))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
    }))
    .pipe(gulp.dest(path.join(__dirname, '..', 'build')));
});
