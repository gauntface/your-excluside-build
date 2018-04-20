const gulp = require('gulp');
const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const mustache = require('mustache');

async function getImageFiles(index) {
  const carouselPath = path.posix.join(__dirname, '..', 'src', 'images', `carousel-${index}`);
  const results = glob.sync(path.posix.join(carouselPath, '**', '*.{jpg,png}'), {
    absolute: true,
  });
  return results.map((filePath) => {
    return path.posix.sep + path.relative(path.posix.join(__dirname, '..', 'src'), filePath);
  });
}

async function buildCarousel(index) {
  const carouselPath = path.join(__dirname, '..', 'src', 'carousel');
  const carouselImages = await getImageFiles(index);

  const template = (await fs.readFile(
    path.join(__dirname, 'templates', 'carousel.hbs')
  )).toString();

  const renderedGallery = mustache.render(template, {
    photos: carouselImages,
  });

  await fs.mkdirp(carouselPath);
  await fs.writeFile(
    path.join(carouselPath, `carousel-${index}.html`),
    renderedGallery,
  );
}

async function carousel() {
  await buildCarousel(1);
  await buildCarousel(2);
}

gulp.task(carousel);
