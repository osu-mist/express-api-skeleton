const del = require('del');
const forever = require('forever-monitor');
const gulp = require('gulp');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('babel-clean', () => del(['build']));

gulp.task('babel-compile', () => gulp.src(['**/*.js', '!build/**', '!node_modules/**'])
  .pipe(sourcemaps.init())
  .pipe(babel({ presets: ['@babel/preset-env'] }))
  .pipe(sourcemaps.write('../maps'))
  .pipe(gulp.dest('build/dist')));

gulp.task('babel', gulp.series('babel-clean', 'babel-compile'));

/**
 * @summary Use Eslint linting *.js file besides source files in node_modules
 */
gulp.task('lint', () => gulp.src(['**/*.js', '!build/**', '!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
  .pipe(babel()));

/**
 * @summary Run unit test
 */
gulp.task('test', () => gulp.src(['build/dist/tests/unit/*.js'])
  .pipe(babel())
  .pipe(mocha({ reporter: 'spec' })));

/**
 * @summary Start application using forever
 */
gulp.task('start', () => new forever.Monitor('build/dist/app.js').start());


/**
 * @summary Run test and lint task parallelly before start the apllication
 */
gulp.task('run', gulp.series(gulp.parallel('lint', 'babel'), 'test', 'start'));
