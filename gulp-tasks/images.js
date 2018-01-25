const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

const images = () => {
  const extensions = [
    'jpeg',
    'jpg',
    'png',
    'gif',
    'svg',
  ];
  return gulp.src(`${global.__buildConfig.src}/**/*.{${extensions.join(',')}}`)
  .pipe(imagemin([
    imagemin.gifsicle(),
    imagemin.svgo(),
    imagemin.jpegtran(),
    pngquant({
      quality: 80
    }),
  ]))
  .pipe(gulp.dest(global.__buildConfig.dest));
};

gulp.task(images);
