var should = require('should');
var mongoose = require("mongoose");
var _pins = require("../lib/pins");

var pins = Object.create(_pins);

mongoose.connect('mongodb://localhost/mappins_test');

describe("Pins", function(){

  afterEach(function(done){
    // delete all pins
    pins.Model.remove(null, done);
  });

  it("convert a placemark to a pin", function (done) {

    var pin = pins.placemarkToPin(sample_placemark);

    should.exist(pin);
    pin.should.have.property('name');
    pin.should.have.property('description');
    pin.should.have.property('longitude');
    pin.should.have.property('latitude');
    done();

  });

  it("saves a pin", function(done) {

    var pin = pins.placemarkToPin(sample_placemark);

    pins.savePin(pin)
    .then(function() {
      done();
    },
    function(err) {
      done(err);
    })
    .done();

  });

  it("saves kml with multiple placemarks", function (done) {

    pins.savePlacemarks(sample_kml)
    .then(function(count) {
      count.should.equal(2);
      done();
    },
    function(err) {
      done(err);
    })
    .done();

  });

  it("saves kml with only one placemark", function (done) {

    pins.savePlacemarks(sample_kml_single_placemark)
    .then(function(count) {
      count.should.equal(1);
      done();
    },
    function(err) {
      done(err);
    })
    .done();

  });

  it("deleteAllPins should return a promise", function(done) {

    var result = pins.deleteAllPins(); 
    should.exist(result);
    result.should.be.a('object');
    should.exist(result.then);
    result.then.should.be.a('function');
    done();

  });

  it("delete all pins", function(done) {

    var pinToDelete = new pins.Model({
      name: 'deleteme'
    });

    pinToDelete.save(function(err) {
      if (err) done(err);
      else {
        pins.deleteAllPins()
        .then(function(count) {
          count.should.equal(1);
          done();
        },
        function(err) {
          done(err);
        })
        .done();
      }
    });

  });

  it("load all pins", function(done) {

    pins.savePlacemarks(sample_kml)
    .then(function() {

      pins.loadAllPins().then(function(allPins) {
        allPins.length.should.equal(2);
        done();
      },
      function(err) {
        done(err);
      });

    },
    function(err) {
      done(err);
    })
    .done();

  });

  it("open close connection", function() {
    mongoose.connection.close();
    mongoose.connect('mongodb://localhost/mappins_test');
  });

});

// A placemark as a javascript object.
var sample_placemark = {
    "name": "Munich",
    "Snippet": "Germany",
    "description": "Germany",
    "styleUrl": "#style1",
    "Point": { "coordinates": "11.558007,48.144836,0.000000" }
  };

// A kml file as a javascript object.
var sample_kml = {
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

// When there's only one placemark in the kml the Placemark propery will be an object not an array.
var sample_kml_single_placemark = {
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
      "Placemark": 
      {
        "name": "Munich2",
        "Snippet": "Germany",
        "description": "Germany",
        "styleUrl": "#style1",
        "Point": {
          "coordinates": "11.558007,48.144836,0.000000"
        }
      }
    }
  };

