/*jshint indent: 2,strict: true,node: true*/

"use strict";

var q = require('q'),
    _ = require('underscore'),
    mongoose = require('mongoose'),
    Schema = require('mongoose').Schema;  

var PinModel = mongoose.model('pins', new Schema({
    name: String,
    description: String,
    longitude: Number,
    latitude: Number
  }));  

function savePin(pin) {

  var deferred = q.defer();

  pin.save(function (err) {
    if (err)
      deferred.reject(new Error(err));
    else
      deferred.resolve();
  });

  return deferred.promise;
}
  
// Accepts a javascript object representation of a placemark and converts it to a pin.
function placemarkToPin(placemark) {
  var coords = placemark.Point.coordinates.split(',');

  var pin = new PinModel({
    name: placemark.name,
    description: placemark.description, 
    longitude: coords[0],
    latitude: coords[1] 
  });

  return pin;
}

// Accepts a javascript object representation of a KML file and returns an array of promises to
// save the placemarks to the database as pins.
function _makePromises(kml) {
  var promises = [];

  var placemarks = kml.Document.Placemark;

  if (placemarks instanceof Array) {
    _.each(placemarks, function (placemark) {
      promises.push(savePin(placemarkToPin(placemark)));
    });
  } else {
    // if there's only one it will be an object, not an array
    promises.push(savePin(placemarkToPin(placemarks)));
  }

  return promises;
}

function savePlacemarks(kml) {
  var deferred = q.defer();
  var promises = _makePromises(kml);

  q.all(promises)
  .then(function () {
    deferred.resolve(promises.length); // return count of pins saved
  },
  function (err) {
    var msg = 'error saving pins: ' + (err.message || err);
    deferred.reject(new Error(msg));
  })
  .done();

  return deferred.promise;
}

function deleteAllPins() {
  var deferred = q.defer();

  PinModel.remove(function (err, count) {
    if (err)
      deferred.reject(new Error(err));
    else
      deferred.resolve(count);
  });

  return deferred.promise;
}

function loadAllPins() {
  var deferred = q.defer();

  PinModel.find(function (err, allpins) {
    if (err)
      deferred.reject(new Error(err));
    else
      deferred.resolve(allpins);
  });

  return deferred.promise;
}

var pins = {
  Model : PinModel,
  deleteAllPins : deleteAllPins,
  loadAllPins : loadAllPins,
  savePin : savePin,
  placemarkToPin : placemarkToPin,
  savePlacemarks : savePlacemarks
};

module.exports = pins;


