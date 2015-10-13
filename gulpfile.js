'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var sass = require('gulp-sass');
var pleeease = require('gulp-pleeease');
var header = require('gulp-header');
var csscomb = require('gulp-csscomb');
var cssmin = require('gulp-cssmin');
var jade = require('gulp-jade');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');
var runSequence = require('run-sequence');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ff >= 30',
  'chrome >= 39',
  'safari >= 7',
  'opera >= 23',
];

gulp.task('sass', function() {
  return gulp.src(['./src/scss/*.scss', './src/scss/**/_*.scss'])
    .pipe(plumber())
    .pipe(sass())
    .pipe(pleeease({
      minifier: false,
      autoprefixer: AUTOPREFIXER_BROWSERS
    }))
    .on('error', console.error.bind(console))
    .pipe(header('@charset "utf-8";\n'))
    .pipe(gulp.dest('./dist/'))
    .on('end', reload);
});

gulp.task('sass:deproy', function() {
  return gulp.src(['src/scss/*.scss', 'src/scss/**/_*.scss'])
    .pipe(sass())
    .pipe(pleeease({
      minifier: false,
      autoprefixer: AUTOPREFIXER_BROWSERS
    }))
    .pipe(csscomb())
    .pipe(cssmin())
    .pipe(header('@charset "utf-8";\n'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('jade', function() {
  return gulp.src(['./src/jade/*.jade', 'src/jade/**/*.jade', '!src/jade/**/_*.jade'])
    .pipe(plumber())
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./dist/'))
    .on('end', reload);
});

gulp.task('coffee', function() {
  return gulp.src(['./src/coffee/*.coffee', './src/coffee/**/_*.coffee'])
    .pipe(plumber())
    .pipe(coffee({
      bare: true
    }))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('./dist/js/'))
});

gulp.task('compile-js', function() {
  var compileFileName = 'application.js'
  return gulp.src(['./src/js/*.js', '!src/js/' + compileFileName])
    .pipe(uglify())
    .pipe(concat(compileFileName))
    .pipe(gulp.dest('./dist/assets/js/'))
    .on('end', reload);
});


gulp.task('image', function() {
  return gulp.src(['./src/img/**/*', '/src/img/*'])
    .pipe(gulp.dest('./dist/img/'));
});

gulp.task('clean', function(callback) {
  del(['./dist/'], callback);
});

gulp.task('build', function(callback) {
  //  runSequence('clean', ['jade', 'sass:deproy', 'coffee', 'compile-js', 'image'], callback);
  runSequence(['jade', 'sass:deproy', 'coffee', 'compile-js', 'image'], callback);
});

gulp.task('default', function() {
  browserSync({
    notify: false,
    port: 3000,
    server: {
      baseDir: ['./dist/']
    }
  });
  gulp.watch(['./src/scss/*.scss', './src/scss/**/_*.scss'], ['sass']);
  gulp.watch(['./src/jade/*.jade', './src/jade/**/*.jade', 'src/jade/**/_*.jade'], ['jade']);
  gulp.watch(['./src/coffee/*.coffee', './src/coffee/**/_*.coffee'], ['coffee']);
  gulp.watch(['./src/js/*.js'], ['compile-js']);
});
