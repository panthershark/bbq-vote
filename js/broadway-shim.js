
var App = function() {};

App.prototype.use = function(plugin, options) {
  plugin.attach.call(this, options);
};

module.exports = broadway = {
  App: App
};