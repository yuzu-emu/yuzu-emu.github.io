const fs = require('fs');
const exec = require('child_process').exec;

const gulp = require('gulp');
const log = require('fancy-log');
const parseArgs = require('minimist');
const concat = require('gulp-concat');
const imageResize = require('gulp-image-resize');
const parallel = require('concurrent-transform');
const browserSync = require('browser-sync').create();

// Gulp Run Tasks
gulp.task('scripts:compatdb', function (callback) {
    exec('yarn run compatdb', { cwd: './scripts/shared-hugo-scripts/' }, function (err, stdout, stderr) {
        callback(err);
    });
});

gulp.task('scripts:wiki', function (callback) {
    exec('yarn run wiki', { cwd: './scripts/shared-hugo-scripts/' }, function (err, stdout, stderr) {
        callback(err);
    });
});

gulp.task('assets:images', () => {
    const bannerImages = gulp.src('build/images/banners/*', {base: './'})
        .pipe(imageResize({width: 824, height: 306, crop: false}))
        .pipe(gulp.dest('./'));
    const iconImages = gulp.src('build/images/game/icons/*', {base: './'})
        .pipe(imageResize({width: 48, height: 48, crop: true}))
        .pipe(gulp.dest('./'));

    return parallel(bannerImages, iconImages);
});

gulp.task('hugo', (callback) => {
    import('hugo-bin').then((hugo) => {
        exec(hugo.default + ' -s ./site/ -d ../build/ -v --gc', (err, stdout, stderr) => {
            console.log(stdout);
            callback(err);
        });
    });
});

gulp.task('final:serve', (done) => {
    browserSync.init({
        open: false,
        server: {
            baseDir: 'build'
        }
    });

    gulp.watch('site/assets/js/**/*', gulp.series('hugo'));
    gulp.watch('src/scss/**/*', gulp.series('hugo'));
    gulp.watch('site/**/*.html', gulp.series('hugo'));
    gulp.watch('site/**/*.md', gulp.series('hugo'));
    gulp.watch('site/**/*.png', gulp.series('hugo'));

    gulp.watch('build/**/*.html').on('change', (x) => {
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
let ephemeralURL = null;

if (parseArgs(process.argv).production) {
    process.env.NODE_ENV = 'production';
    process.env.HUGO_ENV = 'PRD';
    process.env.HUGO_BASEURL = `https://${cname}`;
    finalCommand = 'final:publish';
} else if ((ephemeralURL = parseArgs(process.argv).ephemeral)) {
    process.env.NODE_ENV = 'production';
    process.env.HUGO_ENV = 'PRD';
    process.env.HUGO_BASEURL = ephemeralURL;
    finalCommand = 'final:publish';
} else {
    process.env.HUGO_ENV = 'DEV';
    process.env.HUGO_BASEURL = 'http://localhost:3000';
    finalCommand = 'final:serve';
}

log.info(`process.env.HUGO_ENV = '${process.env.HUGO_ENV}'`);
log.info(`process.env.HUGO_BASEURL = '${process.env.HUGO_BASEURL}'`);

gulp.task('default', gulp.series('hugo', 'assets:images', finalCommand));
gulp.task('all', gulp.series(gulp.parallel('scripts:compatdb', 'scripts:wiki'), 'hugo', 'assets:images', finalCommand));
gulp.task('content', gulp.series('hugo', finalCommand));
