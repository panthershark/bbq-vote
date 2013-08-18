var app = require('./app');
var $ = app.$;
var Backbone = require('backbone');

// container pointers
var containers = require('./containers.js')(app);
var $wrapper = containers.$wrapper;
var $main = containers.$main;
var $left = containers.$left;

Backbone.emulateHTTP = true;

// Generate the routes from the app config
var routes = require('./routes.js')(app);

// Routes are scrubbed. Log em!
eventEmitter.emit('log', routes);

// attach models to app
app.models = {
  // TODO: add models
};


// attach views to app
app.views = {
  // TODO: add views
};


$(function() {
  var router = app.plugins.router;
  var backboneRouter = new (Backbone.Router.extend({

    routes: routes,

    voteList: function() {
      var voteModel = app.models.votes;
      var voteList = app.views.votes;

      voteModel.fetch(function(err, data) {
        if (err) {
          eventEmitter.emit('bbq-error', { 
            component: 'api', 
            error: new Error('Api failed with response: ' + response) 
          });
          return;
        }

        voteList.render(data, function(err) {
          if (err) {
            eventEmitter.emit('bbq-error', { 
              component: 'render', 
              error: err
            });
          }
        });

      });
      
      eventEmitter.emit('page-change', {page: 'voteList'});
    },

    castVote: function(id) {

      // TODO: show voting form.

      // clear and assign id to the model
      // var detailModel = app.models.detail;
      // detailModel.clear().set({ id: id });

      // // The view already exists, but we still need to update the model
      // detailModel.fetch({
      //   success: function (model, response, options) {
      //     eventEmitter.emit('vast-page-change', {page: 'pdp'});
      //   },
      //   error: function(model, response, options) {
      //     eventEmitter.emit('vast-error', { component: 'api', error: new Error('Api failed with response: ' + response) });
      //   }
      // });  

    },

    // redirect routes.
    home: function() {
      // TODO: home route
    },

    navigate: function(fragment, options) {
      Backbone.Router.prototype.navigate(fragment.replace(/^\//, ''), options);
    }

  }))();

  // attach router to plugins so that it canb be used anywhere.
  app.plugins.backboneRouter = backboneRouter;

  // vast-load signifies the app is loaded.  Ready means that it is ready and listening for history.
  eventEmitter.emit('bbq-load', app);

  // there are no async inits here so just fire ready.
  eventEmitter.emit('bbq-ready', app);
});

