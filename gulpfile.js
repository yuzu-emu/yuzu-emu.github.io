const fs = require('fs');
const { spawnSync } = require("child_process");

const gulp = require('gulp');
const log = require('fancy-log');
const parseArgs = require('minimist');

const hugoDefaultArgs = ["-s", "./site/", "-d", "../build", "-v", "--gc"];

// Gulp Run Tasks
gulp.task('scripts:compatdb', function (callback) {
    callback(
        spawnSync("yarn", ["run", "compatdb"], { cwd: "./scripts/shared-hugo-scripts/" }).error
    );
});

gulp.task('scripts:wiki', function (callback) {
    callback(
        spawnSync("yarn", ["run", "wiki"], { cwd: "./scripts/shared-hugo-scripts/" }).error
    );
});

gulp.task('hugo', (callback) => {
    import('hugo-bin').then((hugo) => {
        const result = spawnSync(hugo.default, hugoDefaultArgs, {
            stdio: "inherit",
        });
        if (result.status !== 0) {
            log.error(result.error);
            callback(new Error("Hugo build failed"));
            return;
        }
        callback();
    });
});

gulp.task('final:serve', (done) => {
    import('hugo-bin').then((hugo) => {
        let args = hugoDefaultArgs;
        args.push("server");
        const result = spawnSync(hugo.default, args, {
            stdio: "inherit",
        });
        if (result.status !== 0) {
            log.error(result.error);
            callback(new Error("Failed to start Hugo preview server"));
            return;
        }
        callback();
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

gulp.task('default', gulp.series('hugo', finalCommand));
gulp.task('all', gulp.series(gulp.parallel('scripts:compatdb', 'scripts:wiki'), 'hugo', finalCommand));
gulp.task('content', gulp.series('hugo', finalCommand));
