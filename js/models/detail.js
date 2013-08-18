var Backbone = require('browser-foundation').Backbone;

module.exports = Backbone.Model.extend({
  initialize: function(model, options) {
    this.options = options;
  },

  fetch: function() {
    this.trigger('fetch');
    return Backbone.Model.prototype.fetch.apply(this, arguments);
  },
  
  url: function() {
    return this.options.app.plugins.router.format('detailApi', this.attributes);
  }
});