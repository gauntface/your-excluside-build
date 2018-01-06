const gulp = require('gulp');
const fs = require('fs-extra');
const path = require('path');

gulp.task('clean', () => {
  return fs.remove(path.join(__dirname, '..', 'build'));
});
