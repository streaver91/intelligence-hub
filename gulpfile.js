const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const less = require('gulp-less');
const nodemon = require('gulp-nodemon');

gulp.task('minify-html', () => {
  return gulp.src('views/**/*.ejs')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist/views'));
});

gulp.task('compile-less', () => {
  return gulp.src('styles/*.less')
    .pipe(less())
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('build', gulp.parallel('minify-html', 'compile-less'));

gulp.task('watch', () => {
  gulp.watch('views/**/*.ejs', gulp.series('minify-html'));
  gulp.watch('styles/*.less', gulp.series('compile-less'));
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
