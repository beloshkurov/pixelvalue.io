const gulp = require('gulp'),
      del = require('del'),
      vinylPaths = require('vinyl-paths'),
      babel = require('gulp-babel'),
      //shell = require('gulp-shell'),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglify'),
      order = require('gulp-order'),
      merge = require('merge-stream'),

      sass = require('gulp-sass'),
      importCss = require('gulp-import-css'),
      autoprefixer = require('gulp-autoprefixer'),
      uncss = require('gulp-uncss'),
      minifyCss = require('gulp-minify-css'),
      rename = require('gulp-rename'),

      imagemin = require('gulp-imagemin'),
      pngquant = require('imagemin-pngquant'),

      minifyHTML = require('gulp-minify-html'),
      htmlreplace = require('gulp-html-replace'),
      glob = require('glob');

const paths = {
  js: ['_site/js/**/*.js', '!**/*babel*', '!**/*/picturefill*.js', '!**/*/fontfaceobserver.js'],
  es6: ['_site/js/**/*.es6'],
  css: '_site/css/index.scss',
  images: '_site/assets/**/*',
  html: [
    '_site/**/*.html',
    '!_site/**node_modules/**',
    '!_site/fonts/**'
  ],
  rest: [
    '_site/**',
    '!**/{node_modules,node_modules/**}',
    '!**/{css,css/**}',
    '!**/assets/**',
    '!**/*.html',
    '!_site/**/!(fontfaceobserver).js',
    '!_site/package.json',
    '!_site/*.lock',
    '!_site/*.md'
  ]
}

//build files and put them into /_site directory
/*gulp.task('jekyll', function() {
  return gulp.src('index.html', { read: false })
    .pipe(shell([
      'jekyll build'
  ]))
})*/
var map = require('map-stream');
var log = function(file, cb) {
  console.log(file.path);
  cb(null, file);
};

var exec = require('child_process').exec;
gulp.task('jekyll', function(cb) {
  // build Jekyll
  exec('jekyll build', function(err) {
    if (err) return cb(err); // return error
    cb() // finished task
  })
})

//copy root files to build directory
gulp.task('copy-rest', function() {
  return gulp.src(paths.rest/*, { read: false }*/)
    .pipe(map(log))
    .pipe(gulp.dest('docs/'))
})

gulp.task('clean-dst', function() {
    return del(['docs/**/*'])
})

gulp.task('clean-gen', function() {
    return del(['_site/**/*'])
})

gulp.task('clean', ['clean-dst', 'clean-gen'])

gulp.task('css', function() {
   return gulp.src(paths.css)
       .pipe(sass())
       .pipe(importCss())
       .pipe(map(log))
       .pipe(autoprefixer('last 4 version'))
       /*.pipe(map(log))
       .pipe(uncss({
           html: glob.sync("_site/**\/*.html"),
           ignore: [
               '.active',
               '/\.cookie-policy*\/',
               '.collapse',
               '.collapse.in',
               '.sticky-nav'
          ]
       }))
       .pipe(map(log))*/
       .pipe(minifyCss({ keepBreaks:false }))
       .pipe(rename('index.min.css'))
       .pipe(gulp.dest('docs/css/'))
})

gulp.task("js", function() {
  return merge(gulp.src(paths.es6)
    .pipe(babel()),
    gulp.src(paths.js))
    .pipe(order([
      '**/jquery*.js',
      '**/svg.js',
      '**/trianglify*.js',
      '**/*.js'
    ]))
    .pipe(map(log))
    .pipe(concat("app.js"))
    .pipe(uglify())
    .pipe(gulp.dest("docs/js/"))
})

gulp.task('images', function() {
  return gulp.src(paths.images)
    // Pass in options to the task
    .pipe(imagemin({optimizationLevel: 5},
    [pngquant(), imagemin.gifsicle(), imagemin.jpegtran(), imagemin.optipng(), imagemin.svgo()]
    ))
    .pipe(gulp.dest('docs/assets/'))
})

gulp.task('html', function() {
    return gulp.src(paths.html)
        .pipe(htmlreplace({
          js: 'js/app.js',
          css: 'css/index.min.css'
        }))
        .pipe(minifyHTML({
            quotes: true
        }))
        .pipe(gulp.dest('docs/'))
})

var request = require('request'),
    sitemapUrl = 'http://pixelvalue.io/sitemap.xml';
gulp.task('seo', ['build'], function(cb) {
    request('http://www.google.com/webmasters/tools/ping?sitemap=' + sitemapUrl);
    request('http://www.bing.com/webmaster/ping.aspx?siteMap=' + sitemapUrl);
    cb()
})

var runSequence = require('run-sequence');
gulp.task('default', (cb) => runSequence('clean', 'jekyll', ['css', 'js', 'images'], 'html', 'copy-rest', cb))
