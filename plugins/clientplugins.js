module.exports = function(app) {

  return {
    // The route table without the descriptions
    // see mixdown router for details.
    router: { "routes" : app.plugins.router.lightRoutes }
  };

};