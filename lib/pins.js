var q = require('q'),
    _ = require('underscore'),
    mongoose = require('mongoose'),
    Schema = require('mongoose').Schema;  

module.exports = Pin;

function Pin() {
  if (!(this instanceof Pin)) { 
    return new Pin();
  }
}

Pin.prototype.Model = mongoose.model('pins', new Schema({
  name: String,
  description: String,
  longitude: Number,
  latitude: Number
}));
 
Pin.prototype.deleteAllPins = function(callback) {
  this.Model.remove(function(err, count) {
    callback(err, count); // returns err or count of pins deleted
  });
};

Pin.prototype.loadAllPins = function(callback) {
  this.Model.find(function(err, pins) {
    callback(err, pins);
  });
};

// save a javascript representation of a kml placemark
// to the database
Pin.prototype.saveKmlPin = function(placemark, callback) {
  var coords = placemark.Point.coordinates.split(',');

  var pin = new this.Model({
    name: placemark.name,
    description: placemark.description, 
    longitude: coords[0],
    latitude: coords[1] 
  });

  pin.save(function (err) {
    callback(err);
  });
};

// save a javascript representation of a kml file
// to the database
Pin.prototype.saveKmlPins = function(kml, callback) {
  var that = this;
  var promises = [];
  _.each(kml.Document.Placemark, function (placemark) {
    promises.push(q.ninvoke(that, 'saveKmlPin', placemark));
  });

  q.all(promises)
  .then(function () {
    callback(null, promises.length); // return count of pins saved
  },
  function (err) {
    var msg = 'error saving pins: ' + (err.message || err);
    callback(new Error(msg));
  })
  .done();
};
