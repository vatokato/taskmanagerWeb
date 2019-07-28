const { src, dest, task, watch, parallel   } = require('gulp');

var gulp= require('gulp'),
    rimraf = require('rimraf'),
    rigger = require('gulp-rigger'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    prefixer = require('gulp-autoprefixer'),
    cssmin = require('gulp-minify-css'),
    browserSync = require('browser-sync');

var path = {
    app: {
        html: 'app/*.html',
        js: 'app/js/**/*.js',
        style: 'app/style/*.scss',
    },
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
    },
    watch: {
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        style: 'app/**/*.scss',
    },
    clean: './build'
};

task('html:build', function (done) {
    return src(path.app.html)
        .pipe(rigger())
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}));
});

task('style:build', function (done) {
    return src(path.app.style)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));
});
task('js:build', function(done){
    return src(path.app.js)
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));
});


task('build', parallel('style:build','html:build', 'js:build'));
exports.build = task('build');

task('watch', function (done) {
    watch(path.watch.html,   task('html:build'));
    watch(path.watch.style,  task('style:build'));
    watch(path.watch.js,     task('js:build'));
});

task('server', function (done) {
    browserSync({
        server:{
            baseDir:'./build/'
        },
        open: false
    });
});

task('clean', function (cb) {
    rimraf(path.clean, cb);
});

exports.default = parallel('build','server', 'watch');
