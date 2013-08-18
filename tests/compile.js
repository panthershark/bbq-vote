var test = require('tape').test;
var util = require('util');
var compileLess = require('../index.js');

test('Compile css with bootstrap', function(t) {
  t.plan(2);

  compileLess({
    file: process.cwd() + '/less/screen.less',
    compress: false,
    paths: ['./less', './node_modules/bootstrap/less']
  }, function(err, css)  {

    t.notOk(err, 'Should not return error');

    console.log(css);
    t.ok(css, 'output should exist'); 
    t.end();
  });

});