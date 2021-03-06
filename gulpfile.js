// generated on 2018-07-17 using generator-webapp 3.0.1
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const runSequence = require('run-sequence');

// plugins I added
const uglify = require('gulp-uglifyjs')
const cssnano = require('gulp-cssnano')
const babelify = require('babelify');
const streamify = require('streamify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const compression  = require('compression');


const $ = gulpLoadPlugins();
const reload = browserSync.reload;

let dev = true;

/**
 * @description fn to help me with browserify where I need it
 * @param {*} files the file to transform or an array of files as an array of strings
 * @param {String} src the src folder of the file
 * @param {String} destination the directory folder of the altered file
 */
const browserTransform = (files, src, destination) => {
  browserify(files)
  .transform('babelify')
  .bundle()
  .pipe(source(src))
  .pipe(gulp.dest(destination))
}


const lint = files => {
  return gulp.src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}


gulp.task('styles', () => {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(cssnano()) // minifyCSS
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});


gulp.task('scripts', () => {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write('.')))
    // .pipe(uglify())
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

gulp.task('services', () => {
  return gulp.src('app/services/**/*.js')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write('.')))
    // .pipe(uglify())
    .pipe(gulp.dest('.tmp/services'))
    .pipe(reload({stream: true}));
});

gulp.task('browserTransform', () => {
  browserTransform(['./app/sw.js'], 'sw.js', '.tmp')
  browserTransform(['./app/database/RestaurantDB.js'], 'RestaurantDB.js', '.tmp/database')
  browserTransform(['./app/services/restaurantHelper.js'], 'restaurantHelper.js', '.tmp/services')
  browserTransform(['./app/services/favoriteHelper.js'], 'favoriteHelper.js', '.tmp/services')
  browserTransform(['./app/services/reviewHelper.js'], 'reviewHelper.js', '.tmp/services')
  browserTransform(['./app/scripts/main.js'], 'main.js', '.tmp/scripts')
  browserTransform(['./app/scripts/restaurant_info.js'], 'restaurant_info.js', '.tmp/scripts')
})

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js')
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js')
    .pipe(gulp.dest('test/spec'));
});

gulp.task('html', ['styles', 'scripts', 'services'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if(/\.css$/, $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/fonts/**/*'))
    .pipe($.if(dev, gulp.dest('.tmp/fonts'), gulp.dest('dist/fonts')));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
  runSequence(['clean', 'wiredep'], ['styles', 'scripts', 'services', 'fonts', 'browserTransform'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['.tmp', 'app'],
        middleware: [compression()],
        routes: {
          '/bower_components': 'bower_components'
        },
      },
    });

    gulp.watch([
      'app/*.html',
      'app/images/**/*',
      '.tmp/fonts/**/*',
      '.tmp/styles/**/*',
      '.tmp/services/**/*',
      '.tmp/scripts/**/*'
    ]).on('change', reload);

    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts', 'browserTransform']);
    gulp.watch('app/services/**/*.js', ['services', 'browserTransform']);
    gulp.watch('app/fonts/**/*', ['fonts']);
    gulp.watch('app/sw.js', ['browserTransform']);
    gulp.watch('app/database/RestaurantDB.js', ['browserTransform']);
    gulp.watch('bower.json', ['wiredep', 'fonts']);
  });
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', ['scripts', 'services'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts',
        '/services': '.tmp/services',
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('app/services/**/*.js', ['services']);
  gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe($.filter(file => file.stat && file.stat.size))
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras', 'browserTransform'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean', 'wiredep'], 'build', resolve);
  });
});
