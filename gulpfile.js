const { src, dest, task, watch, parallel, series   } = require('gulp');

var gulp= require('gulp'),
    wait = require('gulp-wait'),
    rimraf = require('rimraf'),
    rigger = require('gulp-rigger'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),

    sass = require('gulp-sass'),
    prefixer = require('gulp-autoprefixer'),
    cssmin = require('gulp-minify-css'),

    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),

    browserSync = require('browser-sync'),
    notify = require("gulp-notify");

var path = {
    app: {
        html: ['app/*.html'],
        js: 'app/js/**/*.js',
        js_lib: 'app/js/lib/**/*.*',
        style: 'app/style/*.scss',
        img: ['app/img/**/*.*'],
        fonts: 'app/fonts/**/*.*'
    },
    build: {
        html: 'build/',
        js: 'build/js/',
        js_production: '../js/',
        js_lib: 'build/js/lib/',
        js_lib_production: '../js/lib/',

        css: 'build/css/',
        css_production: '../css/',

        img: 'build/img/',
        img_production: '../img/',

        fonts: 'build/fonts/',
        fonts_production: '../fonts/'
    },
    watch: {
        html: ['app/**/*.html'],
        js: 'app/js/**/*.js',
        js_lib: 'app/js/lib/**/*.js',
        style: 'app/**/*.scss',
        img: ['app/img/**/*.*'],
        fonts: 'app/fonts/**/*.*'
    },
    clean: './build'
};

task('html:build', function (done) {
    return src(path.app.html)
        .pipe(rigger())
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

task('style:build', function (done) {
    return src(path.app.style)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.css))
        .pipe(dest(path.build.css_production))
        .pipe(browserSync.reload({stream: true}));
});
task('js:build', function(done){
    return src(path.app.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.js))
        .pipe(dest(path.build.js_production))
        .pipe(browserSync.reload({stream: true}));
});
task('js_lib:build', function(done){
    return src(path.app.js_lib)
        .pipe(dest(path.build.js_lib))
        .pipe(dest(path.build.js_lib_production))
        .pipe(browserSync.reload({stream: true}));
});
task('img:build', function (done) {
    return src(path.app.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(dest(path.build.img))
        .pipe(dest(path.build.img_production))
        .pipe(browserSync.reload({stream: true}));
});


task('fonts:build', function(done) {
    return src(path.app.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(dest(path.build.fonts_production));
});

task('build', parallel('img:build','style:build','fonts:build', 'html:build', 'js:build', 'js_lib:build'));
exports.build = task('build');

task('watch', function (done) {
    watch(path.watch.img,    task('img:build'));
    watch(path.watch.html,   task('html:build'));
    watch(path.watch.style,  task('style:build'));
    watch(path.watch.js,     task('js:build'));
    watch(path.watch.js_lib, task('js_lib:build'));
    watch(path.watch.fonts,  task('fonts:build'));
});

task('server', function (done) {
    browserSync({
        server:{
            baseDir:'./build/'
        },
        open: false //запрет автооткрывать браузер
    });
});

task('clean', function (cb) {
    rimraf(path.clean, cb);
});

exports.default = parallel('build','server', 'watch');
