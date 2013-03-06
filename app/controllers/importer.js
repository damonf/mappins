var xml2js = require('xml2js'),
    q = require('q'),
    pin = require('../../lib/pins')();

// Render the import pins view.
exports.importPins = function(req, res) {
  console.log('route - importPins');
  res.render('importPins', { title: 'Import Pins' });
};

// Extracts pins from the KML document (in the request body) and saves to db.
exports.importKml = function(req, res) {
  console.log('route - importKml');

  var parser = new xml2js.Parser();

  q.nfcall(parser.parseString, req.body.pinsKml)
  .then(function(kml) {

      var result;
      if (req.body.overwrite === 'true') {
        result = q.ninvoke(pin, 'deleteAllPins').then(function() { 
          return q.ninvoke(pin, 'saveKmlPins', kml); });
      }
      else {
        result = q.ninvoke(pin, 'saveKmlPins', kml);
      }

      result.then(function(count) {
          console.log(count + ' pins imported');
          res.send(count.toString());
        },
        function(err) {
          var msg = err.message || err;
          console.log(msg);
          res.send({ error: msg});
      })
      .done();
    },
    function(err) {
      var msg = 'error parsing pins file: ' + (err.message || err);
      res.send({ error: msg});
  })
  .done();
};

