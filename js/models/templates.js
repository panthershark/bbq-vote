var Templates = function(options) {

  // get the url from the router config.
  this.url = options.app.plugins.router.format('templateApi');
  this.app = options.app;
  this.$ = options.app.$;

  this.pending = [];
  this.tcache = null;
};

Templates.prototype.processPending = function(err) {
  var tcache = this.tcache;

  tvm.pending.forEach(function(cb) {
    cb(err, tcache);
  });

  // clear queue.
  tvm.pending.length = 0;
};


// callback(err, data)
Templates.prototype.fetch = function(callback) {
  var $ = this.$;

  this.pending.push(callback);

  var jqxhr = $.getJSON(this.url, function(data) {
    tvm.tcache = data;
    processPending(null);
  });

  jqxhr.fail(function(response) { 
    processPending(response);
  });

  return jqxhr;
};

module.exports = Templates;