var gulp = require('gulp');
var server = require('gulp-express');
var clean = require('gulp-clean');
var less = require('gulp-less');
var ts = require('gulp-typescript');
var path = require('path');
var webpack = require('webpack-stream');
var tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', function () {
    return gulp
        .src('dist', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('copy', ['clean'], function () {
    return gulp
        .src([
            './public/**/*.*'
        ], {base: './src'})
        .pipe(gulp.dest('dist'));
});

gulp.task('less', function () {
    return gulp.src('./src/less/style.less')
        .pipe(less())
        .pipe(gulp.dest('./dist/public/css'));
});

gulp.task('build-server', ['copy', 'less'], function () {
    return tsProject.src()
        .pipe(ts(tsProject))
        .js.pipe(gulp.dest(function (file) {
            file.path = file.path.replace('src/', '');
            return 'dist';
        }));
});

gulp.task('dist', ['build-server'], function () {
    return gulp.src('src/main.tsx')
      .pipe(webpack( require('./webpack.config.js') ))
      .pipe(gulp.dest('dist/'));
});

gulp.task('server-dev', ['dist'], function () {
    // Start the server at the beginning of the task
    server.run(['dist/server-dev.js']);

    // Restart the server when file changes
    gulp.watch('src/views/**/*.*', ['copy', 'less']);
    gulp.watch(['src/less/**/*.less'], ['less']);
    gulp.watch(['src/public/scripts/**/*.js'], ['jshint']);
    gulp.watch(['src/public/img/**/*'], server.notify);
    gulp.watch(['src/main.tsx', 'routes/**/*.js'], [server.run]);
});