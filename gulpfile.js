const gulp = require('gulp');

// Load tasks
require('./gulp-tasks/clean.js');
require('./gulp-tasks/gallery.js');
require('./gulp-tasks/html.js');

gulp.task('build', gulp.series([
  'clean',
  'gallery',
  gulp.parallel([
    'html'
  ]),
]));

gulp.task('default', gulp.series(['build']));
