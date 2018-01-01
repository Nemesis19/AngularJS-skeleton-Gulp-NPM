// declarations
var gulp = require('gulp');
var gulpif = require('gulp-if');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var pngquant = require('gulp-pngquant');
var plumber = require('gulp-plumber');
var cache = require('gulp-cache');
var templateCache = require('gulp-angular-templatecache');
var ngAnnotate = require('gulp-ng-annotate');
var notify = require('gulp-notify');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var wrap = require('gulp-wrap');
var del = require('del');
var yargs = require('yargs');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();

// variable definitions
const root = 'app';
const alerts = false;
const browser = 'Firefox';
// const browser = 'Google Chrome';
// const browser = 'Safari';
const paths = {
		dist: './dist/',
		cache: './cache/',
		scripts: [`${root}/js/**/*.js`, `!${root}/**/*.spec.js`],
		tests: `${root}/**/*.spec.js`,
		styles: `${root}/sass/*.scss`,
		templates: `${root}/**/*.html`,
		modules: [
			'angular/angular.js',
			'angular-cookies/angular-cookies.js',
			'angular-sanitize/angular-sanitize.js',
			'angular-i18n/angular-locale_it-it.js',
			'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
			'@uirouter/angularjs/release/angular-ui-router.js',
			'angular-resource/angular-resource.js',
			'angular-ui-notification/dist/angular-ui-notification.js',
			'ng-focus-if/focusIf.js'
		],
		cssModules: [
			'bootstrap/dist/css/bootstrap.css',
			'angular-ui-notification/dist/angular-ui-notification.css'
		],
		static: [
			`${root}/index.html`,
			`${root}/fonts/**/*`
		]
};

// service functions
function errorPlumber(errTitle) {
	return plumber({
		title: errTitle || "Error running Gulp",
		message: "Error: <%= error.message %>"
	});
}

// dist compiling tasks
// compile and minify all the html template files of AngularJS Components and Directives
gulp.task('templates', function() {
  return gulp.src(paths.templates)
  	.pipe(errorPlumber('Error compiling Templates'))
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(templateCache({
	  root: `${root}`,
	  standalone: true,
	  transformUrl: function (url) {
		return url.replace(path.dirname(url), '.');
	  }
	}))
	.pipe(gulp.dest('./cache'))
	.pipe(gulpif(alerts, notify({message: 'Templates task completed'})));
});

// compile and minify all the Javascript Vendor files: external dependencies
gulp.task('modules', ['templates'], function() {
	return gulp.src(paths.modules.map(module => 'node_modules/' + module))
		.pipe(errorPlumber('Error compiling Modules'))
		.pipe(sourcemaps.init())
		.pipe(concat('vendor.js'))
		.pipe(gulpif(yargs.argv.deploy, uglify()))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.dist + 'js'))
		.pipe(gulpif(alerts, notify({message: 'Modules task completed'})));
});

// compile and minify Vendor CSS
gulp.task('css', function() {
	return gulp.src(paths.cssModules.map(module => 'node_modules/' + module))
		.pipe(errorPlumber('Error compiling Vendor CSS'))
		.pipe(concat('vendor.css'))
		.pipe(cssnano())
		.pipe(gulp.dest(paths.dist + 'css'))
		.pipe(gulpif(alerts, notify({message: 'Vendor CSS task completed'})));
});

// compile and minify Custom CSS
gulp.task('scss', function() {
	return gulp.src(paths.styles)
		.pipe(errorPlumber('Error compiling SCSS'))
		.pipe(sass())
		.pipe(autoprefixer('last 2 version'))
		.pipe(rename('main.css'))
		.pipe(cssnano())
		.pipe(gulp.dest(paths.dist + 'css'))
		.pipe(gulpif(alerts, notify({message: 'SCSS task completed'})));
});

// compile and minify Angular APP js files
gulp.task('app', ['modules'], function() {
  return gulp.src([
		`!${root}/js/**/*.spec.js`,
		`${root}/js/**/*.module.js`,
		...paths.scripts,
		'./cache/templates.js'
	])
	.pipe(errorPlumber('Error compiling App'))
	.pipe(sourcemaps.init())
	.pipe(gulpif(yargs.argv.deploy, babel({presets: ['env']})))
	.pipe(wrap('(function(angular){\n\'use strict\';\n<%= contents %>})(window.angular);'))
	.pipe(concat('app.js'))
	.pipe(ngAnnotate())
	.pipe(gulpif(yargs.argv.deploy, uglify()))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest(paths.dist + 'js'))
	.pipe(gulpif(alerts, notify({message: 'App task completed'})));
});

// process and compress images
gulp.task('images', function() {
	return gulp.src('app/imgs/**/*.+(png|jpg|jpeg|gif|svg)')
		.pipe(errorPlumber('Error processing Images'))
		.pipe(gulpif('!*.png', cache(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
			imagemin.svgo({
				plugins: [
					{removeViewBox: true},
					{cleanupIDs: false}
				]
			})
		]))))
		.pipe(gulpif('*.png', cache(pngquant({quality: '100'}))))
		.pipe(gulp.dest(paths.dist + 'imgs'))
		.pipe(gulpif(alerts, notify({message: 'Images task completed'})));
});

// copy static resources
gulp.task('static', ['clean'], function() {
	return gulp.src(paths.static, {base: root})
		.pipe(errorPlumber('Error copying Static resources'))
		.pipe(gulp.dest(paths.dist));
});

// clean the 'dist' and 'cache' folders
gulp.task('clean', function() {
	return del([
			paths.dist + '/**/*',
			paths.cache + '/**/*'
		]);
});

// clear the cache on local system
gulp.task('clear:cache', function() {
	return cache.clearAll();
});

// run the Browser Sync server
gulp.task('serve', function() {
	return browserSync.init({
			files: paths.dist + '/**',
			server: {
				baseDir: paths.dist
			},
			browser: browser,
			notify: false
		});
});

// set up the watches
gulp.task('watch', ['serve'], function() {
	gulp.watch(paths.styles, ['scss']);
	gulp.watch([paths.scripts, paths.templates], ['app']);
});

// default startup task
gulp.task('default', function() {
	runSequence('static', ['images', 'css', 'scss', 'app'], ['serve', 'watch']);
});

// deployment task
gulp.task('production', function() {
	console.log('Creating the production version...');
	runSequence('static', ['images', 'css', 'scss', 'app'], ['serve', 'watch']);
});

