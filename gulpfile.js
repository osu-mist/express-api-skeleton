const forever = require('forever-monitor');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

gulp.task('lint', () => gulp.src(['**/*.js', '!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

gulp.task('test', () => gulp.src(['tests/unit/*.js'])
  .pipe(mocha({ reporter: 'spec' })));

gulp.task('start', () => new forever.Monitor('app.js').start());

gulp.task('run', gulp.series(gulp.parallel('lint', 'test'), 'start'));
