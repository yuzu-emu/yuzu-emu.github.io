const fs = require('fs');
const exec = require('child_process').exec;

const gulp = require('gulp');
const log = require('fancy-log');
const parseArgs = require('minimist');
const merge = require('merge-stream');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const imageResize = require('gulp-image-resize');
const parallel = require('concurrent-transform');
const os = require('os');
const browserSync = require('browser-sync').create();

// Gulp Run Tasks
gulp.task('scripts:compatdb', callback => {
    exec('cd ./scripts/shared-hugo-scripts/compatdb/ && yarn install && node app.js', (err, stdout, stderr) => {
        callback(err);
    });
});

gulp.task('scripts:twitter', callback => {
    exec('cd ./scripts/shared-hugo-scripts/twitter/ && yarn install && node app.js', (err, stdout, stderr) => {
        callback(err);
    });
});

gulp.task('scripts:wiki', callback => {
    exec('cd ./scripts/shared-hugo-scripts/wiki/ && yarn install && node app.js', (err, stdout, stderr) => {
        callback(err);
    });
});

gulp.task('assets:images', () => {
    const baseImages = gulp.src('build/images/*', {base: './'})
        .pipe(gulp.dest('./'));
    const jumbotronImages = gulp.src('build/images/jumbotron/*', {base: './'})
        .pipe(imageResize({width: 426, height: 240, crop: true}))
        .pipe(gulp.dest('./'));
    const bannerImages = gulp.src('build/images/banners/*', {base: './'})
        .pipe(imageResize({width: 824, height: 306, crop: false}))
        .pipe(gulp.dest('./'));
    const boxartImages = gulp.src('build/images/game/boxart/*', {base: './'})
        .pipe(imageResize({width: 328, height: 300, crop: true}))
        .pipe(gulp.dest('./'));
    const iconImages = gulp.src('build/images/game/icons/*', {base: './'})
        .pipe(imageResize({width: 48, height: 48, crop: true}))
        .pipe(gulp.dest('./'));
    const screenshotImages = gulp.src('build/images/screenshots/*')
        .pipe(imageResize({width: 640, height: 360, crop: false}))
        .pipe(gulp.dest('build/images/screenshots/thumbs'));
    const postImages = gulp.src('build/**/*.png')
        .pipe(parallel(imageResize({quality: 0.8, format: 'jpg', percentage: 80})), os.cpus().length)
        .pipe(rename({extname: '.png.jpg'}))
        .pipe(gulp.dest('build/'));

    return merge(baseImages, jumbotronImages, bannerImages, boxartImages, iconImages, screenshotImages, postImages);
});

gulp.task('assets:js', () => {
    return gulp.src(['src/js/**/*.js'])
        .pipe(concat('script.js'))
        .pipe(gulp.dest('build/js'));
});

gulp.task('assets:scss', () => {
    const postCssOptions = [cssnano];
    return gulp.src('src/scss/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postCssOptions))
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.stream());
});

gulp.task('hugo', callback => {
    exec('hugo -s ./site/ -d ../build/ -v', (err, stdout, stderr) => {
        console.log(stdout);
        callback(err);
    });
});

gulp.task('final:serve', (done) => {
    browserSync.init({
        open: false,
        server: {
            baseDir: 'build'
        }
    });

    gulp.watch('src/js/**/*', gulp.series('assets:js'));
    gulp.watch('src/scss/**/*', gulp.series('assets:scss'));
    gulp.watch('site/**/*.html', gulp.series('hugo'));
    gulp.watch('site/**/*.md', gulp.series('hugo'));

    gulp.watch('build/**/*.html').on('change', function(x) {
        browserSync.reload(x);
    });

    done();
});

gulp.task('final:publish', (done) => {
    fs.writeFileSync('build/CNAME', `${cname}`);
    fs.writeFileSync('build/robots.txt', `Sitemap: https://${cname}/sitemap.xml\n\nUser-agent: *`);
    done();
});

const cname = 'yuzu-emu.org';
let finalCommand = null;

if (parseArgs(process.argv).production) {
    process.env.NODE_ENV = 'production';
    process.env.HUGO_ENV = 'PRD';
    process.env.HUGO_BASEURL = `https://${cname}`;
    finalCommand = 'final:publish';
} else {
    process.env.HUGO_ENV = 'DEV';
    process.env.HUGO_BASEURL = 'http://localhost:3000';
    finalCommand = 'final:serve';
}

log.info(`process.env.HUGO_ENV = '${process.env.HUGO_ENV}'`);
log.info(`process.env.HUGO_BASEURL = '${process.env.HUGO_BASEURL}'`);

gulp.task('default', gulp.series(gulp.parallel('assets:js', 'assets:scss'), 'hugo', 'assets:images', finalCommand));
gulp.task('all', gulp.series(gulp.parallel('scripts:compatdb', 'scripts:wiki'), gulp.parallel('assets:js', 'assets:scss'), 'hugo', 'assets:images', finalCommand));
gulp.task('content', gulp.series('hugo', finalCommand));
