const fs = require('fs-extra');
const path = require('path');
const gulp = require('gulp');
const mustache = require('mustache');

const services = async () => {
  const servicesImagePath = path.join(__dirname, '..', 'src',
    'images', 'services');
  const files = (await fs.readdir(servicesImagePath)).filter((fileName) => {
    const stats = fs.statSync(path.join(servicesImagePath, fileName));
    if (stats.isDirectory()) {
      return false;
    }
    return true;
  }).map((file) => {
    return `/images/services/${file}`;
  });

  const templatePath = path.join(__dirname, 'templates', 'services.hbs');
  const template = (await fs.readFile(templatePath)).toString();
  const renderedServices = mustache.render(template, {
    imagesList: files.join(','),
    initialImage: files[0],
  });

  await fs.writeFile(
    path.join(__dirname, '..', 'src', 'partials', 'services-images.hbs'),
    renderedServices
  );
}

gulp.task(services);
