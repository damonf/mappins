module.exports = function(app) {

  // map routes
  var map = require('../app/controllers/map');
  app.get('/', map.index);
  app.get('/pins', map.pins);

  // pin importer routes
  var importer = require('../app/controllers/importer');
  app.get('/importPins', importer.importPins);
  app.post('/importKml', importer.importKml);
};

