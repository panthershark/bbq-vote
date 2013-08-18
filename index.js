var LessPlugin = require('mixdown-less');
var broadway = require('broadway');

// Build custom boostrap for responsive site.
// options.file {String} Path to file to compile.
// options.compress {Boolean}
// options.paths {Array} List of paths for @import directive.
module.exports = function(options, callback) {
  var app = new broadway.App();
  app.use(new LessPlugin(), options);

  var pl = app.less.pipeline();
  var cbFired = false;
  var cb = function(err, data) {
    if (!cbFired) {
      cbFired = true;
      callback(err, data);
    }
  };

  pl.on('error', cb).on('end', cb).execute({
    file: options.file
  });
};
