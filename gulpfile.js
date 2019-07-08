const forever = require('forever-monitor');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

/**
 * @summary Use Eslint linting *.js file besides node_modules, dist
 */
gulp.task('lint', () => gulp.src(['**/*.js', '!node_modules/**', '!dist/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

/**
 * @summary Run unit test
 */
gulp.task('test', () => gulp.src(['tests/unit/*.js'])
  .pipe(mocha({ reporter: 'spec' })));

/**
 * @summary Bundle using webpack
 */
gulp.task('webpack', () => gulp.src('app.js')
  .pipe(webpack(webpackConfig))
  .pipe(gulp.dest('dist/')));


/**
 * @summary Start application using forever
 */
gulp.task('start', () => new forever.Monitor('dist/app.js').start());


/**
 * @summary Run test and lint task parallelly before start the apllication
 */
gulp.task('run', gulp.series(gulp.parallel('lint', 'test'), 'start'));
