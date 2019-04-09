const forever = require('forever-monitor');
const gulp = require('gulp');
const babel = require('gulp-babel');
// const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('babel', () => gulp.src(['**/*.js', '!node_modules/**'])
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(babel({ presets: ['@babel/preset-env'] }))
  // .pipe(concat('all.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('dist')));

/**
 * @summary Use Eslint linting *.js file besides source files in node_modules
 */
gulp.task('lint', () => gulp.src(['**/*.js', '!dist/**', '!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
  .pipe(babel()));

/**
 * @summary Run unit test
 */
gulp.task('test', () => gulp.src(['dist/tests/unit/*.js'])
  .pipe(babel())
  .pipe(mocha({ reporter: 'spec' })));

/**
 * @summary Start application using forever
 */
gulp.task('start', () => new forever.Monitor('dist/app.js').start());


/**
 * @summary Run test and lint task parallelly before start the apllication
 */
gulp.task('run', gulp.series(gulp.parallel('lint', 'babel'), 'test', 'start'));
