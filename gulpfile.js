// Load plugins
var gulp = require("gulp"),
  $ = require("gulp-load-plugins")(),
  sass = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  minifycss = require("gulp-minify-css"),
  jshint = require("gulp-jshint"),
  uglify = require("gulp-uglify"),
  rename = require("gulp-rename"),
  concat = require("gulp-concat"),
  mmq = require("gulp-merge-media-queries"),
  del = require("del"),
  fileinclude = require("gulp-file-include"),
  runSequence = require("run-sequence");

var srcFiles = {
  js: "src/js/**/*.js",
  css: "src/scss/**/*.{scss,sass}",
  templates: "src/templates/**/*.html",
};

var destFolder = {
  js: "www/js",
  css: "www/css/",
  templates: "www/",
};

gulp.task("styles", function () {
  return gulp
    .src(srcFiles.css)
    .pipe(
      $.changed(destFolder.css, {
        extension: ".css",
      })
    )
    .pipe(
      sass({
        includePaths: require("node-bourbon").includePaths,
        outputStyle: "expanded",
      }).on("error", sass.logError)
    )
    .pipe(gulp.dest(destFolder.css))
    .pipe(mmq({ log: true }))
    .pipe(
      $.autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false,
      })
    )
    .pipe($.if("*.css", $.csso()))
    .pipe($.rename("styles.min.css"))
    .pipe(gulp.dest(destFolder.css))
    .pipe(
      $.size({
        title: "styles",
      })
    );
});

// Scripts
gulp.task("scripts", function () {
  return gulp
    .src(srcFiles.js)
    .pipe(jshint(".jshintrc"))
    .pipe(jshint.reporter("default"))
    .pipe(concat("main.js"))
    .pipe(gulp.dest(destFolder.js))
    .pipe(rename({ suffix: ".min" }))
    .pipe(uglify())
    .pipe(gulp.dest(destFolder.js));
});

//Include Templates
gulp.task("fileinclude", function () {
  console.log("logged fileinclude start");
  return gulp
    .src(srcFiles.templates)
    .pipe(
      $.replace(/@@include\(([\s\S]*?)\)/g, function (match, params) {
        // Normalize multi-line JSON in @@include parameters
        // This handles cases where formatters break JSON strings across lines
        var normalized = params
          // Join string literals that are broken across lines
          // Pattern: "text\n  more text" -> "text more text"
          .replace(/"([^"]*?)\s*\n\s*([^"]*?)"/g, '"$1 $2"')
          // Handle cases where string continues after newline: "text\n  continuation"
          .replace(/("(?:[^"\\]|\\.)*")\s*\n\s*([^",}]+)(")/g, "$1 $3")
          // Remove all remaining newlines and normalize whitespace
          .replace(/\n\s*/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        return "@@include(" + normalized + ")";
      })
    )
    .pipe(fileinclude())
    .pipe(gulp.dest(destFolder.templates));
});

// Clean
gulp.task("clean", function (cb) {
  del(["www/css", "www/js/scripts.js"], cb);
});

gulp.task("watch", function () {
  // Watch templates
  gulp.watch(srcFiles.templates, ["fileinclude"]);

  // Watch .scss files
  gulp.watch(srcFiles.css, ["styles"]);

  // Watch .js files
  gulp.watch(srcFiles.js, ["scripts"]);
});

gulp.task(
  "build",
  ["clean", "styles", "scripts", "fileinclude"],
  function () {}
);

gulp.task("default", ["clean", "styles", "scripts", "watch"], function () {});
