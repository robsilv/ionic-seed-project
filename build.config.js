module.exports = {
  port: 8000,

  files: {
    js: {

      // Use uncompressed versions of 3rd-pary libraries.
      // They will be compressed in production.
      // Any libraries added to /vendor must be added here.
      // If you remove a library you must remove it here too.
      vendor: [
         'vendor/angular/angular.js',
         'vendor/angular-animate/angular-animate.js',
         'vendor/angular-resource/angular-resource.js',
         'vendor/angular-sanitize/angular-sanitize.js',
         'vendor/angular-ui-router/release/angular-ui-router.js',
         'vendor/collide/collide.js',
         'vendor/ionic/js/ionic-angular.js',
         'vendor/ionic/js/ionic-bundle.js',
         'vendor/ionic/js/ionic.js',
      ],

      app: [
        'src/js/app.js',
        'src/**/*.js',
        '!src/**/*-spec.js',
        '!src/**/*-scenario.js',
      ],

      buildDest: 'www/js'
    },

    css: {
      main: [
        'src/**/*.css',
        '!src/assets/*.css',
        '!src/assets/**/*.css',
        'src/common/**/*.css',
        'src/components/**/*.css',
        'vendor/ionic/css/ionic.css'
      ],

      buildDest: 'www/css'
    },
    html: {
      index: 'src/index.html',

      tpls: {
        all: 'src/**/*-template.html'
      },

      buildDest: 'www'
    },

    img: {
      src: [
        'src/assets/images/*.png',
        'src/assets/images/*.jpg',
        'src/assets/css/sprites/**/*.svg',
        'src/assets/css/sprites/**/*.png'
      ],
      buildDest: './www/img'
    },
    svg: {
      src: 'src/assets/images/svgs/src/*.svg',
      dest: 'src/assets/images/svgs/dest'
    },
    fonts: {
      src: 'vendor/ionic/fonts/**/*',
      buildDest: 'www/fonts'
    },

    map: {
      src: 'vendor/bootstrap/dist/css/bootstrap-theme.css.map',
      name: 'bootstrap-theme.css.map',
      buildDest: 'www/css'
    },

    test: {
      e2e: 'src/**/*-scenario.js',

      unit: [
        'www/js/vendor.js',
        'test/mock/*.js',
        'www/js/templates.js',
        'www/js/app.js',
        'src/**/*-spec.js'
      ]
    }
  }
}