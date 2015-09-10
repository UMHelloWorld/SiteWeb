module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-babel');

  grunt.initConfig({
      babel: {
          options: {
              sourceMap: true
          },
          dist: {
              files: [{
                expand: true,
                src: '**/*.es6.js',
                dest: './',
                ext: '.js'
              }]
          }
      }
  });

  grunt.registerTask('default', ['babel']);
};