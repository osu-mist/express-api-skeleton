const forever = require('forever-monitor');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

/**
 * @summary Use Eslint linting *.js file besides source files in node_modules
 */
gulp.task('lint', () => gulp.src(['**/*.js', '!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

/**
 * @summary Run unit test
 */
gulp.task('test', () => gulp.src(['tests/unit/*.js'])
  .pipe(mocha({ reporter: 'spec' })));

/**
 * @summary Start application using forever
 */
gulp.task('start', () => new forever.Monitor('app.js').start());


/**
 * @summary Run test and lint task parallelly before start the apllication
 */
gulp.task('run', gulp.series(gulp.parallel('lint', 'test'), 'start'));
