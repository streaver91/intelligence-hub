const cleanCSS = require('gulp-clean-css');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const minifyInline = require('gulp-minify-inline');
const less = require('gulp-less');
const nodemon = require('gulp-nodemon');
const uglify = require('gulp-uglify-es').default;

gulp.task('minify-html', () => {
  return gulp.src('views/**/*.ejs')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
    }))
    .pipe(minifyInline())
    .pipe(gulp.dest('dist/views'));
});

gulp.task('compile-less', () => {
  return gulp.src('public/styles/*.less')
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/public/styles'));
});

gulp.task('minify-js', function () {
  return gulp.src('public/scripts/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/public/scripts'));
});

gulp.task('copy-root-assets', function () {
  return gulp.src('public/*', { nodir: true })
    .pipe(gulp.dest('dist/public'));
});

gulp.task('copy-images', function () {
  return gulp.src('public/images/*')
    .pipe(gulp.dest('dist/public/images'));
});

gulp.task('build', gulp.parallel(
  'minify-html', 'compile-less', 'minify-js', 'copy-root-assets', 'copy-images'));

gulp.task('watch', (callback) => {
  gulp.watch('views/**/*.ejs', gulp.series('minify-html'));
  gulp.watch('public/styles/*.less', gulp.series('compile-less'));
  gulp.watch('public/scripts/*.js', gulp.series('minify-js'));
  gulp.watch('public/*', gulp.series('copy-root-assets'));
  gulp.watch('public/images/*', gulp.series('copy-images'));
  callback();
});

gulp.task('nodemon', (callback) => {
  let started = false;
  return nodemon({
    script: 'index.js',
    ext: 'js ejs',
  }).on('start', () => {
    if (!started) {
      callback();
      started = true;
    }
  });
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'nodemon')));
