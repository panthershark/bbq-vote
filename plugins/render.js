var _ = require('lodash'),
  Handlebars = require('broadway-handlebars');

var Render = function() {};

var urlCapable = function(app) {
  return app.plugins.router && app.plugins.router.format;
};

Render.prototype.attach = function(options) {
  var app = options.app,
      opt = _.clone(options);

  // add custom helpers to the helpers passed in
  opt.helpers = {
    
    url: function(route, options) {

      return urlCapable(app) ? app.plugins.router.format(route, options.hash) : 'Mixdown Router plugin not defined.  Are you using mixdown-router?';
    },
    json: function(obj) {
        return JSON.stringify(obj);
    }

  }

  this.use(new Handlebars(), opt);
  this.render.helpers = opt.helpers;
};

module.exports = Render;