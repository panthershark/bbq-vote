// container pointers

module.exports = function(app) {
  var $ = app.$;
  return {
    $wrapper: $('#vast_container'),
    $main: $('#vast-main'),
    $left: $('#vast-left')
  };
};