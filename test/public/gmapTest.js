(function () {
  
  function testPins() {
      var pin1 = {
        name: 'mypin1',
        description: 'my test pin 1', 
        longitude: 0,
        latitude: 1
      };

      var pin2 = {
        name: 'mypin2',
        description: 'my test pin 2', 
        longitude: 1,
        latitude: 0 
      };

      return [pin1, pin2];
  }

  function setUp() {
    /*:DOC += <div id="mapCanvas">
      </div>*/

    this.theMap = document.getElementById("mapCanvas");
    this.gmap = mpins.gmap.create(this.theMap, { lat: 0, lng: 1 });

    // fake ajax requests
    this.xhr = sinon.useFakeXMLHttpRequest();
    var requests = [];
    this.requests = requests; 
    this.xhr.onCreate = function (req) { requests.push(req); };
  }

  function tearDown() {
    this.xhr.restore();
  }

  TestCase("gmapTest", {

    setUp: setUp, 
    tearDown: tearDown,

    "test create should return object": function () {
      assertObject(this.gmap);
      assert(mpins.gmap.isPrototypeOf(this.gmap));
    },

    "test create creates a google map": function() {
      assertInstanceOf(google.maps.Map, this.gmap._theMap );
      assertEquals(0, this.gmap._theMap.getCenter().lat());
      assertEquals(1, this.gmap._theMap.getCenter().lng());
    },

    "test can put a pin on the map": function() {

      var pin = testPins()[0];

      this.gmap.putPin(pin, 'img/pin.png');  

      assertEquals(1, this.gmap._markers.length);
      var marker = this.gmap._markers[0];
      assertInstanceOf(google.maps.Marker, marker);
      assertEquals('mypin1, my test pin 1', marker.getTitle());
      assertEquals('img/pin.png', marker.getIcon().url);
      assertEquals(1, marker.getPosition().lat());
      assertEquals(0, marker.getPosition().lng());
      assertEquals(this.theMap, marker.getMap().getDiv());
    },

    "test removePins removes the pins from the map": function () {
      var pins = testPins();

      this.gmap.putPin(pins[0], 'img/pin.png');  
      this.gmap.putPin(pins[1], 'img/pin.png');  

      var removed = this.gmap.removePins();

      assertEquals(2, removed.length);
      assertNull(removed[0].getMap());
      assertNull(removed[1].getMap());
      assertEquals(0, this.gmap._markers.length);
    },

    "test loadPins loads a bunch of pins from the url": function () {

      this.gmap.loadPins('/pins/url', '/img/pin.png');  

      assertEquals('/pins/url', this.requests[0].url);

      this.requests[0].respond(
        200,
        { "Content-Type": "application/json" },
        JSON.stringify(testPins())
      );

      assertEquals(2, this.gmap._markers.length);

      var marker = this.gmap._markers[0];
      assertInstanceOf(google.maps.Marker, marker);
      assertEquals('mypin1, my test pin 1', marker.getTitle());
      assertEquals('/img/pin.png', marker.getIcon().url);
      assertEquals(1, marker.getPosition().lat());
      assertEquals(0, marker.getPosition().lng());
      assertEquals(this.theMap, marker.getMap().getDiv());

      marker = this.gmap._markers[1];
      assertInstanceOf(google.maps.Marker, marker);
      assertEquals('mypin2, my test pin 2', marker.getTitle());
      assertEquals('/img/pin.png', marker.getIcon().url);
      assertEquals(0, marker.getPosition().lat());
      assertEquals(1, marker.getPosition().lng());
      assertEquals(this.theMap, marker.getMap().getDiv());
    },

    "test returns pins on success": function () {

      var somePins = testPins();
      var pins;

      this.gmap.loadPins('/pins/url', '/img/pin.png', function(err, data) {
        pins = data;
      });

      assertEquals('/pins/url', this.requests[0].url);

      this.requests[0].respond(
        200,
        { "Content-Type": "application/json" },
        JSON.stringify(somePins)
      );

      assertEquals(2, pins.length);
      assertEquals(somePins, pins);
    },

    "test returns error string": function () {

      var error;

      this.gmap.loadPins('/pins/url', '/img/pin.png', function(err, data) {
        error = err;
      });  

      assertEquals('/pins/url', this.requests[0].url);

      this.requests[0].respond(
        200,
        { "Content-Type": "application/json" },
        JSON.stringify('some error message')
      );

      assertEquals('some error message', error);
    },

    "test returns no data": function () {

      var error;

      this.gmap.loadPins('/pins/url', '/img/pin.png', function(err, data) {
        error = err;
      });  

      assertEquals('/pins/url', this.requests[0].url);

      this.requests[0].respond(
        200,
        { "Content-Type": "application/json" },
        JSON.stringify(null)
      );

      assertEquals('/pins/url returned no data', error);
    },

    "test ajax fails": function () {

      var error;

      this.gmap.loadPins('/pins/url', '/img/pin.png', function(err, data) {
        error = err;
      });  

      assertEquals('/pins/url', this.requests[0].url);

      this.requests[0].respond(
        404,
        { "Content-Type": "application/json" },
        JSON.stringify('some text')
      );

      assertEquals('404', error.status);
      assertTrue(/some text/.test(error.responseText));
    }

  });

}());
