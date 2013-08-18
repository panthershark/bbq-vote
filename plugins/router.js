var _ = require('lodash');
var util = require('util');
var MixdownRouter = require('mixdown-router');
var fs = require('fs');
var url = require('url');
var getClientPlugins = require('./clientplugins');

// router impl.
var Router = function() {
  if (!(this instanceof Router)) {
    return new Router();
  }

  MixdownRouter.apply(this, arguments);
};

util.inherits(Router, MixdownRouter);


// Added server version as a cachebuster.
Router.prototype.attach = function (options) {
  var app = options.app;
  var cachebuster = null;
  var cacheBusterRoutes = ['image', 'css', 'js', 'templateApi'];

  try {
    cachebuster = app.config.server.version;
  }
  catch (e) {
    cachebuster = e.message;
  }

  MixdownRouter.prototype.attach.apply(this, arguments);

  var _url = this.router.url;

  this.router.url = function(route, params) {
    var u = _url.call(this, route, params);

    if (cacheBusterRoutes.indexOf(route) >= 0) {
      u.query = u.query || {};
      u.query.v = cachebuster;
    }

    return u;
  }

};

Router.prototype.voteApi = function(httpContext) {
  var app = httpContext.app;
  var res = httpContext.response;

  app.plugins.votes.get({}, function(err, data) {

    if (err) {
      app.plugins.error.fail(err, res);
      return;
    }

    var viewModel = {
      votes: data.votes
    };

    app.plugins.json(viewModel, res);

  });

};

Router.prototype.page = function(httpContext) {
  var app = httpContext.app;
  var res = httpContext.response;
  var vm = { plugins: getClientPlugins(app) };

  app.plugins.render('index', vm, function(err, html) {
    if (err) {
      app.plugins.error.fail(err, res);
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);

  });

};

Router.prototype.image = function(httpContext) {
  var app = httpContext.app;
  var pipelines = app.plugins.pipelines;
  var res = httpContext.response;
  var pl = pipelines.static();

  pl.name += ': ' + httpContext.url.path;

  pl.on('error', function(err, results) {
    if (err) {
      logger.error('Caught error on image pipeline', err);
      console.log(httpContext.params.image_src);
    }

    app.plugins.error.fail(err, res);
  });

  pl.execute({ 
    path: httpContext.url.pathname.replace(/\/img/, ''),
    res: 
    res, 
    locations: [ './img', './' + app.id + '/img' ] 
  });

};

Router.prototype.css = function(httpContext) {
  var app = httpContext.app;
  var pipelines = app.plugins.pipelines;
  var res = httpContext.response;
  var pl = pipelines.static();

  var pl = app.plugins.less.pipeline();
  pl.name += ': ' + httpContext.url.path;
  
  var sent = false;
  var sendResponse = function(err, results) {
    if (!sent) {
      sent = true;

      if (err) {
        app.plugins.error.fail(err, res);
      }
      else {
        var cssContent = results && results.length ? results[results.length - 1] : null;

        app.plugins.static.stream({
          path: httpContext.url.pathname,
          res: res,
          content: cssContent 
        }, function(err) {
          app.plugins.error.fail(err, res);
        });

      }
    }
  };

  pl.on('error', sendResponse).on('end', sendResponse).execute({
    file: './less/' + httpContext.params.css_src.replace(/\.css$/, '.less')
  });

};

Router.prototype.js = function(httpContext) {
  var app = httpContext.app;
  var pipelines = app.plugins.pipelines;
  var req = httpContext.request;
  var res = httpContext.response;
  var pl = pipelines.generic();

  var compress = function(path, callback) {
    fs.exists(path, function(exists) {
      if (exists) {
        try {
          app.plugins.browserify(path, callback);
        } catch (e) {
          callback(e);
        }
      }
      else {
        callback();
      }
    });
  };
  
  pl.name += ': ' + httpContext.url.path;

  pl.on('error', function(err, results) {
    if (err) {
      logger.error('Caught error on JS pipeline', err);
    }

    app.plugins.error.fail(err, res);
  });

  pl.use(function(results, next) {
    compress(results[0].pathname, next);
  });

  pl.on('end', function(err, results) {
    if (!err) {
      app.plugins.static.stream({
        path: httpContext.url.pathname,
        res: res,
        content: results[results.length - 1]
      }, function(err) {
        app.plugins.error.fail(err, res);
      });
    }
  });

  pl.execute({ req: req, res: res, pathname: './js/' + httpContext.params.js_src });

};

// Templates
Router.prototype.templates = function(httpContext) {
  var app = httpContext.app;
  var res = httpContext.response;
  var headers = app.config.plugins.static.options.headers;

  app.plugins.templates(function(err, templates) {
    if (err) {
      app.plugins.error.fail(err, res);
    }
    else {
      app.plugins.json(templates, res, headers);
    }
  });

};

Router.prototype.manifest = function(httpContext) {
  var app = httpContext.app;
  var res = httpContext.response;
  var headers = app.config.plugins.static.options.headers;

  app.plugins.json(app.plugins.router.routes, res, headers);
};


module.exports = Router;