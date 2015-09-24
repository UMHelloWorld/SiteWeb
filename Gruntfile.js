module.exports = function(grunt) {
  grunt.initConfig({
      watch: {
        scripts: {
          files: ['./**/*.es6.js'],
          tasks: ['default'],
          options: {
            spawn:false
          }
        },
        stylus: {
          files: ['./static/styles/**/*.styl'],
          tasks: ['compileCss'],
          options: {
            spawn:false
          }
        }
      },
      babel: {
        options: {
            sourceMap: true
        },
        dist: {
            files: [{
              expand: true,
              cwd: './',
              src: ['**/*.es6.js'],
              dest: './',
              ext: '.js',
            }]
        }
      },
      stylus: {
        compile: {
          expand: true,
          cwd: 'static/styles',
          src: ['**/*.styl'],
          dest: 'static/styles',
          filter: 'isFile',
          ext: '.css'
        }
      }
  });

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-stylus');

  grunt.registerTask('default', ['babel']);
  grunt.registerTask('compileCss', ['stylus:compile']);

  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });
};
