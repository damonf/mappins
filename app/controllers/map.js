var q = require('q'),
    pin = require('../../lib/pins')();

// Show the map.
exports.index = function(req, res) {
  console.log('route - index');
  res.render('index', { title: 'Map Pins' });
};

// Load the pins from the database.
exports.pins = function(req, res) {
  console.log('route - pins');

  q.ninvoke(pin, 'loadAllPins')
  .then(function(result) {
      console.log('loaded ' + result.length + ' pins');
      res.send({ pins: result });
    },
    function(err) {
      var msg = 'error loading pins: ' + (err.message || err);
      console.error(msg);
      res.send({ error: msg });
  })
  .done();
};

