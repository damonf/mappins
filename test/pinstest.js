var should = require('should');
var mongoose = require("mongoose");
var pin = require("../lib/pins")();

mongoose.connect('mongodb://localhost/mappins_test');

var sampleKmlPin = {
    "name": "Munich",
    "Snippet": "Germany",
    "description": "Germany",
    "styleUrl": "#style1",
    "Point": { "coordinates": "11.558007,48.144836,0.000000" }
  };

var sampleKmlPins = {
    "@": {
      "xmlns": "http://earth.google.com/kml/2.2"
    },
    "Document": {
      "name": "Travels",
      "description": "Places i've been.",
      "Style": {
        "@": {
          "id": "style1"
        },
        "IconStyle": {
          "Icon": {
            "href": "http://maps.gstatic.com/mapfiles/ms2/micons/grn-pushpin.png"
          }
        }
      },
      "Placemark": [
        {
          "name": "Munich2",
          "Snippet": "Germany",
          "description": "Germany",
          "styleUrl": "#style1",
          "Point": {
            "coordinates": "11.558007,48.144836,0.000000"
          }
        },
        {
          "name": "Bordeaux",
          "Snippet": "France",
          "description": "France",
          "styleUrl": "#style1",
          "Point": {
            "coordinates": "-0.579180,44.837788,0.000000"
          }
        }
      ]
    }
  };

describe("Pins", function(){

  afterEach(function(done){
    // delete all pins
    pin.Model.remove(null, done);
  });

  it("saves a KML pin", function(done){
    pin.saveKmlPin(sampleKmlPin, done);
  });

  it("saves a bunch of KML pins", function (done) {
    pin.saveKmlPins(sampleKmlPins, function(err, msg) {
      if (err) done(err);
      else {
        msg.should.equal(2);
        done();
      }
    });
  });

  it("delete a KML pin", function(done) {
    var pin1 = new pin.Model({
      name: 'deleteme'
    });

    pin1.save(function(err) {
      if (err) done(err);
      else
        pin.deleteAllPins(function(err, count) {
          if (err) done(err);
          else {
            count.should.equal(1);
            done();
          }
        });
    });
  });

  it("load all pins", function(done) {
    pin.saveKmlPins(sampleKmlPins, function(err, msg) {
      if (err) done(err);
      else {
        pin.loadAllPins(function(err, pins) {
          if (err) done(err);
          else {
            pins.length.should.equal(2);
            done();
          }
        });
      }
    });
  });

  it("open close connection", function() {
    mongoose.connection.close();
    mongoose.connect('mongodb://localhost/mappins_test');
  });

});

