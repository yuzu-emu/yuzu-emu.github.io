const fs = require('fs');
const exec = require('child_process').exec;

const gulp = require('gulp');
const util = require('gulp-util');
const merge = require('merge-stream');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const imageResize = require('gulp-image-resize');
const browserSync = require('browser-sync').create();

const baseUrl = 'https://yuzu-emu.org';
const cname = 'yuzu-emu.org';
let finalCommand = null;

// Gulp Run Tasks
gulp.task('default', ['start:setup'], callback => {
	runSequence('hugo', finalCommand, callback);
});

gulp.task('all', ['start:setup'], callback => {
	runSequence(['scripts:twitter', 'scripts:wiki'],
              ['assets:js', 'assets:scss'],
              'hugo',
              'assets:images',
              finalCommand,
              callback);
});

gulp.task('assets', ['start:setup'], callback => {
	runSequence(['assets:js', 'assets:scss'], 'hugo', 'assets:images', finalCommand, callback);
});

// Gulp Pipeline
gulp.task('start:setup', () => {
	if (util.env.production) {
		process.env.HUGO_ENV = 'PRD';
		process.env.HUGO_BASEURL = baseUrl;
		finalCommand = 'final:publish';
	} else {
		process.env.HUGO_ENV = 'DEV';
		process.env.HUGO_BASEURL = 'http://localhost:3000';
		finalCommand = 'final:serve';
	}

	util.log(`process.env.HUGO_ENV = '${process.env.HUGO_ENV}'`);
	util.log(`process.env.HUGO_BASEURL = '${process.env.HUGO_BASEURL}'`);
});

gulp.task('scripts:twitter', callback => {
	exec(`cd ./scripts/shared-hugo-scripts/twitter/ && npm install && node app.js`, (err, stdout, stderr) => {
		console.log(stdout);
		console.log(stderr);
		callback(err);
	});
});

gulp.task('scripts:wiki', callback => {
	exec(`cd ./scripts/shared-hugo-scripts/wiki/ && npm install && node app.js`, (err, stdout, stderr) => {
		console.log(stdout);
		console.log(stderr);
		callback(err);
	});
});

gulp.task('assets:images', () => {
	const baseImages = gulp.src(`build/images/*`, {base: './'})
      .pipe(gulp.dest('./'));
	const jumbotronImages = gulp.src(`build/images/jumbotron/*`, {base: './'})
      .pipe(imageResize({width: 786, height: 471, crop: true}))
      .pipe(gulp.dest('./'));
	const bannerImages = gulp.src(`build/images/banners/*`, {base: './'})
      .pipe(imageResize({width: 824, height: 306, crop: false}))
      .pipe(gulp.dest('./'));
	const boxartImages = gulp.src(`build/images/game/boxart/*`, {base: './'})
      .pipe(imageResize({width: 328, height: 300, crop: true}))
      .pipe(gulp.dest('./'));
	const iconImages = gulp.src(`build/images/game/icons/*`, {base: './'})
      .pipe(imageResize({width: 48, height: 48, crop: true}))
      .pipe(gulp.dest('./'));
	const screenshotImages = gulp.src(`build/images/screenshots/*`)
      .pipe(imageResize({width: 400, height: 240, crop: false}))
      .pipe(gulp.dest(`build/images/screenshots/thumbs`));
	return merge(baseImages, jumbotronImages, bannerImages, boxartImages, iconImages, screenshotImages);
});

gulp.task('assets:js', () => {
	let userScripts = gulp.src(['src/js/*.js'])
		.pipe(concat('script.js'))
		.pipe(gulp.dest('build/js'));
	let vendorScripts = gulp.src(['src/js/vendor/*.js'])
		.pipe(gulp.dest('build/js'));
	return merge(userScripts, vendorScripts);
});

gulp.task('assets:scss', () => {
	const postCssOptions = [cssnano];
	return gulp.src('src/scss/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(postCssOptions))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.stream());
});

gulp.task('hugo', cb => {
	exec('hugo -s ./site/ -d ../build/ -v', (err, stdout, stderr) => {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
});

function fileChange(x) {
	console.log(`[FileChange] File changed: ${x.path}`);
	browserSync.reload(x);
}

gulp.task('final:serve', () => {
	browserSync.init({
		open: false,
		server: {
			baseDir: 'build'
		}
	});

	gulp.watch('src/js/**/*', ['assets:js']);
	gulp.watch('src/scss/**/*', ['assets:scss']);
	gulp.watch('site/**/*.html', ['hugo']);
	gulp.watch('site/**/*.md', ['hugo']);

	gulp.watch('build/**/*').on('change', fileChange);
});

gulp.task('final:publish', () => {
	fs.writeFileSync(`build/CNAME`, `${cname}`);
	fs.writeFileSync(`build/robots.txt`, `Sitemap: https://${cname}/sitemap.xml\n\nUser-agent: *`);
});
