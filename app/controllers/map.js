var q = require('q'),
    _pins = require('../../lib/pins');

var pins = Object.create(_pins);

// Show the map.
exports.index = function(req, res) {
  console.log('route - index');
  res.render('index', { title: 'Map Pins' });
};

// Load the pins from the database.
exports.pins = function(req, res) {
  console.log('route - pins');

  pins.loadAllPins()
  .then(function(result) {
      console.log('loaded ' + result.length + ' pins');
      res.send(result);
    },
    function(err) {
      var msg = 'error loading pins: ' + (err.message || err);
      console.error(msg);
      res.send(msg);
  })
  .done();
};

