var express = require('express');

module.exports = function(app) {
  var root = require('path').normalize(__dirname + '/..');
  app.set('views', root + '/app/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  //app.use(express.logger());
  app.use(require('less-middleware')({ src: root + '/public' }));
  app.use(express.static(root + '/public'));
  app.use(express.bodyParser());
  app.use(express.favicon(root + '/public/img/pin-red.png'));
  app.use(app.router);
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'internal server error');
  });
};

