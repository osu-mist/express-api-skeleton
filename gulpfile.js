const { spawn } = require('child_process');

const del = require('del');
const forever = require('forever-monitor');
const gulp = require('gulp');
const gulpBabel = require('gulp-babel');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const sourcemaps = require('gulp-sourcemaps');

/**
 * @summary Delete the dist/ directory
 *
 * @returns {Promise<string[]>}
 */
const babelClean = () => del(['dist']);

/**
 * @summary Copy files that don't need to be compiled from src/ to dist/
 *
 * @returns {Stream}
 */
const babelCopy = () => gulp.src(['src/**', '!src/**/*.js', '!src/tests/integration/**'])
  .pipe(gulp.dest('dist'));

/**
 * @summary Transpile JavaScript files and place them in dist/. Also, generate sourcemaps
 *
 * @returns {Stream}
 */
const babelCompile = () => gulp.src(['src/**/*.js'])
  .pipe(sourcemaps.init())
  .pipe(gulpBabel())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('dist'));

/**
 * @summary Use Eslint linting *.js file besides source files in node_modules
 *
 * @returns {Stream}
 */
const lint = () => gulp.src(['src/**/*.js', '*.js'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());

/**
 * @summary Check Flow types
 *
 * @returns {ChildProcess}
 */
const typecheck = () => spawn('./node_modules/.bin/flow', ['check'], { stdio: 'inherit' });

/**
 * @summary Run unit tests (requires Babel transpiling beforehand)
 *
 * @returns {Stream}
 */
const test = () => gulp.src('dist/tests/unit/*.js')
  .pipe(mocha({ reporter: 'spec', require: ['source-map-support/register'] }));

/**
 * @summary Start application using forever
 *
 * @returns {Stream}
 */
const start = () => new forever.Monitor('dist/app.js').start();

/**
 * @summary Run all Babel tasks in series
 */
const babel = gulp.series(babelClean, babelCopy, babelCompile);

/**
 * @summary Lint, typecheck and transpile, then test the application
 */
const build = gulp.series(gulp.parallel(lint, typecheck, babel), test);

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
  start,
  babel,
  build,
  devRun,
};
