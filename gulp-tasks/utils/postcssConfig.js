const postcss = require('gulp-postcss');
const cssimport = require('postcss-import');
const cssPresetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');

module.exports = () => {
  return postcss([
    cssimport(),
    cssPresetEnv({
      features: {
        customProperties: {
          // Allows both fallback and CSS variables to be used
          preserve: true,
        }
      }
    }),
    cssnano({
      autoprefixer: false,
    }),
  ]);
};
