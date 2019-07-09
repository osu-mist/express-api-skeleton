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
 * @summary Compile JavaScript files and place them in dist/. Also, generate sourcemaps
 */
const babelCompile = () => gulp.src(['src/**/*.js'])
  .pipe(sourcemaps.init())
  .pipe(gulpBabel())
  .pipe(gulp.dest('dist'));

const babel = gulp.series(babelClean, babelCopy, babelCompile);

/**
 * @summary Use Eslint linting *.js file besides source files in node_modules
 */
const lint = () => gulp.src(['src/**/*.js', '!node_modules/**', '!dist/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());

/**
 * @summary Check Flow types
 */
const typecheck = () => spawn('./node_modules/.bin/flow', ['check'], { stdio: 'inherit' });

/**
 * @summary Run unit tests
 */
const test = () => gulp.src(['dist/tests/unit/*.js'])
  .pipe(mocha({ reporter: 'spec' }));

/**
 * @summary Bundle using webpack
 */
const webpack = () => gulp.task('webpack', () => gulp.src('app.js')
  .pipe(webpackStream(webpackConfig))
  .pipe(gulp.dest('dist/')));

/**
 * @summary Start application using forever
 */
const start = () => new forever.Monitor('dist/app.js').start();

/**
 * @summary Lint and compile, test, and start the application
 */
exports.run = gulp.series(gulp.parallel(lint, typecheck, babel), test, webpack, start);
/**
 * @summary Compile and start the application only
 */
exports.start = gulp.series(babel, start);
/**
 * @summary Compile and test the application only
 */
exports.test = gulp.series(babel, test);
/**
 * @summary Compile the code only
 */
exports.babel = babel;
/**
 * @summary Lint the code only
 */
exports.lint = lint;
/**
 * @summary Typecheck the code only
 */
exports.typecheck = typecheck;
