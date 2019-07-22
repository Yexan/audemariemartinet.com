// Load plugins
var gulp          = require('gulp'),
    $             = require('gulp-load-plugins')(),
    sass          = require('gulp-ruby-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
    minifycss     = require('gulp-minify-css'),
    jshint        = require('gulp-jshint'),
    uglify        = require('gulp-uglify'),
    rename        = require('gulp-rename'),
    concat        = require('gulp-concat'),
    mmq           = require('gulp-merge-media-queries'),
    del           = require('del'),
    fileinclude   = require('gulp-file-include'),
    runSequence   = require('run-sequence');

var srcFiles = {
  js: 'src/js/**/*.js',
  css: 'src/scss/**/*.{scss,sass}',
  templates: 'src/templates/**/*.html'
};

var destFolder = {
  js: 'www/js',
  css: 'www/css/',
  templates: 'www/'
}


gulp.task('styles', function() {
  return sass(srcFiles.css, { style: 'expanded' })
    .pipe($.changed('styles', {
      extension: '.{scss,sass}'
    }))
    .pipe($.sass({
      includePaths: require('node-bourbon').includePaths
    })
    .on('error', console.error.bind(console))
    )
    .pipe(gulp.dest(destFolder.css))
    .pipe(gulp.dest(destFolder.css))
    .pipe(mmq({log: true }))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe($.if( '*.css', $.csso() ))
    .pipe($.rename('styles.min.css'))
    .pipe(gulp.dest(destFolder.css))
    .pipe(gulp.dest(destFolder.css))
    .pipe($.size({
      title: 'styles'
    })
  );
});


// Scripts
gulp.task('scripts', function() {
  return gulp.src(srcFiles.js)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest(destFolder.js))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest(destFolder.js));
});

//Include Templates
gulp.task('fileinclude', function() {
  console.log('logged fileinclude start');
  return gulp.src(srcFiles.templates)
    .pipe(fileinclude())
    .pipe(gulp.dest(destFolder.templates));
});

// Clean
gulp.task('clean', function(cb) {
  del(['www/css', 'www/js/scripts.js'], cb);
});


gulp.task('watch', function() {

  // Watch templates
  gulp.watch(srcFiles.templates, ['fileinclude']);

  // Watch .scss files
  gulp.watch(srcFiles.css, ['styles']);

  // Watch .js files
  gulp.watch(srcFiles.js, ['scripts']);

});


gulp.task('default', ['clean', 'styles', 'scripts', 'watch'], function() {

});
