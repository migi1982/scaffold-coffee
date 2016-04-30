'use strict';
var gulp = require('gulp');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var data = require('gulp-data');
var plumber = require('gulp-plumber');

var sass = require('gulp-sass');
var pleeease = require('gulp-pleeease');
var csscomb = require('gulp-csscomb');
var cssmin = require('gulp-cssmin');

var jade = require('gulp-jade');

var sitemap = require('gulp-sitemap-files');

var del = require('del');
var runSequence = require('run-sequence');
var header = require('gulp-header');

var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var svgmin = require('gulp-svgmin');
var iconfontCss = require('gulp-iconfont-css');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
];
var pkg = require('./package.json');
var BANNER = [
  '@charset "utf-8";',
  '/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @link <%= pkg.url %>',
  ' * @version v<%= pkg.version %>',
  ' * @Author <%= pkg.author %>',
  ' * @Author URI <%= pkg.author %>',
  ' */',
  ''
].join('\n');

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


gulp.task('sass', function() {
  gulp.src(['src/scss/*.scss', 'src/scss/**/_*.scss'])
    .pipe(plumber())
    .pipe(sass())
    .pipe(pleeease({
      minifier: false,
      autoprefixer: {
        browsers: ['last 4 versions', 'Android 2.3']
      },
      //      autoprefixer: AUTOPREFIXER_BROWSERS,
      //      autoprefixer: 'chrome >= 39'
    }))
    .on('error', console.error.bind(console))
    .pipe(header('@charset "utf-8";\n'))
    .pipe(gulp.dest('./dist/css/'))
    .on('end', reload);
});

gulp.task('sass:deproy', function() {
  gulp.src(['src/scss/*.scss', 'src/scss/**/_*.scss'])
    .pipe(sass())
    .pipe(pleeease({
      autoprefixer: {
        browsers: ['last 4 versions', 'Android 2.3']
      },
      minifier: false
    }))
    .pipe(csscomb())
    .pipe(cssmin())
    .pipe(header(BANNER, {
      pkg: pkg
    }))
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('jade', function() {
  gulp.src(['./src/jade/*.jade', 'src/jade/**/*.jade', '!src/jade/**/_*.jade'])
    .pipe(plumber())
    //    .pipe(data(function(file) {
    //      return require('./data.json');
    //    }))
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./dist/'))
    .on('end', reload);
});

gulp.task('coffee', function() {
  gulp.src(['./src/coffee/*.coffee', './src/coffee/**/_*.coffee'])
    .pipe(plumber())
    .pipe(coffee({
      bare: true
    }))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('./dist/js/'))
});

gulp.task('compile-js', function() {
  var compileFileName = 'application.js'
  gulp.src(['./src/js/*.js', '!src/js/' + compileFileName])
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(concat(compileFileName))
    .pipe(gulp.dest('./dist/js/'))
    .on('end', reload);
});

gulp.task('sitemap', function() {
  gulp.src('./dist/**/*.html')
    .pipe(sitemap({
      siteUrl: 'http://www.solana.asia/'
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('clean', function(cb) {
  del(['./dist/**/*.html', './dist/**/*.css', './dist/**/*.xml', , './dist/**/*.js'], cb);
});

gulp.task('build', [], function(cb) {
  runSequence(
    ['sass:deproy', 'jade', 'coffee', 'compile-js'],
    //    'sitemap',
    cb
  );
});

gulp.task('svgmin', function() {
  gulp.src(['./src/icon/*.svg'])
    .pipe(svgmin())
    .pipe(gulp.dest('src/icon'));
});

gulp.task('makefont', function() {
  gulp.src(['./src/icon/*.svg'])
    .pipe(iconfontCss({
      fontName: 'icon',
      path: './src/scss/base/template/icon.scss',
      targetPath: '../scss/base/_icon.scss',
      fontPath: '/fonts/'
    }))
    .pipe(iconfont({
      fontName: 'icon'
    }))
    .pipe(gulp.dest('./src/fonts/'))
});

gulp.task('moveicon', function() {
  gulp.src('./src/fonts/*')
    .pipe(gulp.dest('./dist/fonts/'));
});

gulp.task('iconfont', ['makefont', 'moveicon']);
