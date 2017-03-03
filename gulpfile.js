var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');

/*css*/
var sassSrc = ['frontend/views/**/*.scss'];

gulp.task('sass', function() {
	return gulp.src(sassSrc)
		.pipe(sass({ outputStyle: 'compressed' }))
		.pipe(gulp.dest('public/assets/css'));
})

/*js*/
var scriptSrc = [
	'frontend/models/App.js',
  'frontend/models/*.js',
  'frontend/commons/Events.js',
	'frontend/commons/*.js',
  'frontend/modules/*.js',
	'frontend/*.js'
];

// gulp.task('scripts', function() {
// 	return gulp.src(scriptSrc)
// 		.pipe(concat('ecobici.min.js'))
// 		.pipe(uglify().on('error', function(e){
//             console.log(e);
//          }))
// 		.pipe(gulp.dest('public/assets/js'));
// });
gulp.task('scripts', function() {
	return gulp.src(scriptSrc)
		.pipe(concat('ecobici.js'))
		.pipe(gulp.dest('public/assets/js'));
});


gulp.task('watch', function() {
	gulp.watch(sassSrc.concat(scriptSrc), function() {
		gulp.run('default');
	});
})

gulp.task('default', ['sass','scripts','watch']);
