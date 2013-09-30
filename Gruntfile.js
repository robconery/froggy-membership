
module.exports = function(grunt){

  grunt.initConfig({
    jshint : {
      files : ['lib/**/*js', 'models/**/*.js']
    },
    watch : {
      files: ['lib/**/*js', 'models/**/*.js'],
      tasks : ['jshint']
    }


  });
  //adding a comment
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");

};