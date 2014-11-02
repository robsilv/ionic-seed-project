var gulp = require('gulp'),
	clean = require('gulp-clean'),
	inject = require("gulp-inject"),
	rename = require('gulp-rename'),
	jshint = require('gulp-jshint'),
	minifyCSS = require('gulp-minify-css'),
	html2js = require('gulp-html2js'),
	concat = require('gulp-concat'),
	ngmin = require('gulp-ngmin'),
	uglify = require('gulp-uglify'),
	htmlmin = require('gulp-htmlmin'),
	cache = require('gulp-cache'),
	livereload = require('gulp-livereload'),
	wrap = require('gulp-wrap'),
	karma = require('gulp-karma'),
	protractor = require('gulp-protractor').protractor,
	webdriverStandalone = require('gulp-protractor').webdriver_standalone,
	webdriverUpdate = require('gulp-protractor').webdriver_update,
	runSequence = require('run-sequence'),
	files = require('./build.config.js').files,
	connect = require('connect');

var productionDir = '_public', // production output directory (default: _public)
	port = require('./build.config.js').port;

// Concatenate vendor JS into vendor.js.
gulp.task('js:vendor', function () {
	return gulp.src(files.js.vendor)
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest(files.js.buildDest));
});

// Process app's JS into app.js.
gulp.task('js:app', function () {
	return gulp.src(files.js.app)
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('default'))
		.pipe(ngmin())
		.pipe(concat('app.js'))
		.pipe(wrap('(function ( window, angular, undefined ) {\n'
			// + '\'use strict\';\n'
			+ '<%= contents %>'
			+ '})( window, window.angular );'))
		.pipe(gulp.dest(files.js.buildDest));
});

// Cache app/**/ templates into templates.js.
gulpJSTemplates('all');

// Process css files into main.css.
gulp.task('css', function () {

	return gulp.src(files.css.main)
		//.pipe(ngmin())
		.pipe(concat('app.css'))
		.pipe(gulp.dest(files.css.buildDest));
});

// Process map files.
gulp.task('map', function () {

	return gulp.src(files.map.src)
		//.pipe(ngmin())
		.pipe(concat(files.map.name))
		.pipe(gulp.dest(files.map.buildDest));
});

// HTML files into build dir.
gulp.task('html', function () {
	return gulp.src(files.html.index)
		.pipe(gulp.dest(files.html.buildDest));
});

// Process images.
gulp.task('img', function () {
	return gulp.src(files.img.src)
		.pipe(rename({dirname: ''}))
		.pipe(gulp.dest(files.img.buildDest));
});

// Process fonts.
gulp.task('fonts', function () {
	return gulp.src(files.fonts.src)
		.pipe(gulp.dest(files.fonts.buildDest));
});

// Compile CSS for production.
gulp.task('compile:css', function () {
	return gulp.src('www/**/*.css')
		.pipe(minifyCSS({keepSpecialComments: 0}))
		.pipe(gulp.dest(productionDir));
});

// Compile JS for production.
gulp.task('compile:js', function () {
	return gulp.src('www/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest(productionDir));
});

// Compile HTML for production.
gulp.task('compile:html', function () {
	return gulp.src('www/**/*.htm*')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(productionDir));
});

// Prepare images for production.
gulp.task('compile:img', function () {
	return gulp.src('www/img/**')
		.pipe(gulp.dest(productionDir+'/img'));
});

// Prepare images for production.
gulp.task('compile:fonts', function () {
	return gulp.src('www/fonts/*')
		.pipe(gulp.dest(productionDir+'/fonts'));
});

// Update/install webdriver.
gulp.task('webdriver:update', webdriverUpdate);

// Run webdriver standalone server indefinitely.
// Usually not required.
gulp.task('webdriver:standalone', ['webdriver:update'], webdriverStandalone);

// Run unit tests using karma.
gulp.task('karma', function () {
	return gulp.src(files.test.unit)
		.pipe(karma({
			configFile: 'karma.conf.js',
			action: 'run'
		}))
		.on('error', function(e) {throw e});
});

// Run unit tests using karma and watch for changes.
gulp.task('karma:watch', function () {
	return gulp.src(files.test.unit)
		.pipe(karma({
			configFile: 'karma.conf.js',
			action: 'watch'
		}))
		.on('error', function(e) {throw e});
});

// Run e2e tests using protractor.
// Make sure server task is running.
gulp.task('protractor', ['webdriver:update'], function() {
	return gulp.src(files.test.e2e)
		.pipe(protractor({
			configFile: 'protractor.conf.js',
		}))
		.on('error', function(e) {throw e});
});

// Run e2e tests using protractor and watch for changes.
// Make sure server task is running.
gulp.task('protractor:watch', ['protractor'], function () {
	gulp.watch(['www/**/*', files.test.e2e], ['protractor']);
});

gulp.task('test', ['karma', 'protractor']);

// Clean build directory.
gulpClean('build');

// Clean production directory.
gulpClean(productionDir);

// Clean build and production directories.
gulp.task('clean', function (callback) {
	runSequence(['clean:build', 'clean:'+productionDir], callback);
});

// Build files for local development.
gulp.task('build', function (callback) {
	runSequence(
	'clean:build',
	['js:vendor',
		'js:app',
		'js:templates-all',
		'css',
		'map',
		'html',
		'img',
		'fonts'
	],
	callback);
});

// Process files and put into directory ready for production.
gulp.task('compile', function (callback) {
	runSequence(
	['build', 'clean:'+productionDir],
	[
		'compile:js',
		'compile:css',
		'compile:html',
		'compile:img',
		'compile:fonts'
	],
	callback);
});

// Run server.
gulp.task('server', ['build'], function (next) {
	var server = connect();
	server.use(connect.static('www')).listen(port, next);
});

// Watch task
gulp.task('watch:files', ['server'], function () {
	gulp.watch('build.config.js', ['js:vendor']);

	gulp.watch(files.js.app, ['js:app']);

	gulp.watch(files.html.tpls.all, ['js:templates-all']);

	gulp.watch(files.css.main, ['css']);

	gulp.watch(files.html.index, ['html']);

	gulp.watch(files.img.src, ['img']);

	// Livereload
	var server = livereload();

	gulp.watch('www/**/*', function (event) {
	server.changed(event.path);
	});
});

// Run unit & e2e tests and watch for changes.
gulp.task('watch:test', ['karma:watch', 'protractor:watch']);

// Build, run server, run unit & e2e tests and watch for changes.
gulp.task('watch', function (callback) {
	runSequence('watch:files', 'watch:test', callback);
});

// Same as watch:files.
gulp.task('default', ['watch:files']);



/**
 * Generate tasks for Angular JS template caching
 *
 * @param {string} folder
 * @return stream
 */
function gulpJSTemplates (folder) {
	gulp.task('js:templates-'+folder, function () {
	return gulp.src(files.html.tpls[folder])
		.pipe(html2js({
			outputModuleName: 'templates',
			useStrict: true,
			base: 'src/'
		}))
		.pipe(concat('templates.js'))
		.pipe(gulp.dest(files.js.buildDest));
	});
}

/**
 * Generate cleaning tasks.
 *
 * @param {string} folder
 * @return stream
 */
function gulpClean (folder) {
	gulp.task('clean:'+folder, function () {
	return gulp.src(folder, {read: false, force: true})
		.pipe(clean());
	});
}