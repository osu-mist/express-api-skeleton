const forever = require('forever-monitor');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

// Use ESLint linting *.js files besides source files in node_modules
gulp.task('lint', () => gulp.src(['**/*.js', '!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

// Run unit tests
gulp.task('test', () => gulp.src(['tests/unit/*.js'])
  .pipe(mocha({ reporter: 'spec' })));

// Start application using forever
gulp.task('start', () => new forever.Monitor('app.js').start());


// Run test and lint tasks in parallel before starting the application
gulp.task('run', gulp.series(gulp.parallel('lint', 'test'), 'start'));
