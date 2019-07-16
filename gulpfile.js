const { spawn } = require('child_process');

const del = require('del');
const forever = require('forever-monitor');
const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const sourcemaps = require('gulp-sourcemaps');
const webpackStream = require('webpack-stream');

const webpackConfig = require('./webpack.config.js');

/**
 * @summary Delete the dist/ directory
 */
const babelClean = () => del(['dist']);

/**
 * @summary Copy files that don't need to be compiled from src/ to dist/
 */
const babelCopy = () => gulp.src(['src/**', '!src/**/*.js', '!src/tests/integration/**'])
  .pipe(gulp.dest('dist'));

/**
 * @summary Transpile JavaScript files and place them in dist/. Also, generate sourcemaps
 */
const babelCompile = () => gulp.src(['src/**/*.js'])
  .pipe(sourcemaps.init())
  .pipe(gulpBabel())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('dist'));

/**
 * @summary Use Eslint linting *.js file besides source files in node_modules
 */
const lint = () => gulp.src(['src/**/*.js', '**.js'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());

/**
 * @summary Check Flow types
 */
const typecheck = () => spawn('./node_modules/.bin/flow', ['check'], { stdio: 'inherit' });

/**
 * @summary Run unit tests (requires Babel transpiling beforehand)
 */
const test = () => gulp.src('dist/tests/unit/*.js')
  .pipe(mocha({ reporter: 'spec' }));

/**
 * @summary Bundle using webpack (requires Babel transpiling beforehand)
 */
const bundle = () => gulp.src('dist/app.js')
  .pipe(webpackStream(webpackConfig))
  .pipe(gulp.dest('dist/'));

/**
 * @summary Start application using forever
 */
const start = () => new forever.Monitor('dist/bundle.js').start();

/**
 * @summary Run all Babel tasks in series
 */
const babel = gulp.series(babelClean, babelCopy, babelCompile);

/**
 * @summary Lint and transpile, typecheck, test, and bundle the application
 */
const build = gulp.series(gulp.parallel(lint, typecheck, babel), gulp.parallel(test, bundle));

/**
 * @summary Builds and starts (for development use only)
 */
const devRun = gulp.series(build, start);

module.exports = {
  babelClean,
  babelCopy,
  babelCompile,
  lint,
  typecheck,
  test: gulp.series(babel, test),
  bundle: gulp.series(babel, bundle),
  start,
  babel,
  build,
  devRun,
};
