var broadway = require('./broadway-shim');
var _ = require('lodash');
var Urls = require('mixdown-router/lib/generator.js');  // this is actually an export of mixdown-router for the url gen.
var Handlebars = require('../plugins/render.js');
var TemplatesModel = require('./models/templates.js');

// Load our version of jquery (2.x) and then no conflict global scope back to previous.
require('./externals/jquery.js');

var $ = global.jQuery;
jQuery.noConflict(true);


var app = (function(boot) {
  var plugins = boot.plugins,
      app = { plugins: new broadway.App() };

  // might not really need this, but it is nice if we ever change something about a global lib to have it here.  especially jQuery since it stomps on scope.
  app.$ = $;
  app._ = _;
  app.broadway = broadway;

  // Attach Url plugin
  plugins.router.app = app;
  app.plugins.use(new Urls(), plugins.router);

  // Dynamic plugin for viewResolver for render.
  var tvm = new TemplatesModel({ app: app });

  app.plugins.use(new Handlebars(), {
    app: app,
    viewResolver: {
      all: tvm.fetch.bind(tvm)
    }
  });

  return app;

})(window.BBQ);

// attach pubsub to global namespace
var events = require('events'),
  em = global.eventEmitter;

global.eventEmitter = new events.EventEmitter();

// add all of the events from the shim.  The shim is inline script at the top of the page.
if (em) {
  _.each(em._events, function(evs, name) {
    _.each(evs, function(fn) {
      eventEmitter.on(name, fn);
    });
  });
}


// returns a singleton.
module.exports = app;