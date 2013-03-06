function GMap() {
  if (!(this instanceof GMap)) { 
    return new GMap();
  }

  this.theMap = new google.maps.Map(document.getElementById("mapCanvas"), {
    center: new google.maps.LatLng(-37.824577, 145.051521),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  this.markers = [];
}

// Put a single pin on the map.
GMap.prototype.putPin = function(pin) {
  var name = pin.name + ', ' + pin.description;
  var longitude = pin.longitude;
  var latitude = pin.latitude;
  var pinImageUrl = 'img/pin-red.png';
  var pinImage = new google.maps.MarkerImage(pinImageUrl);
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(latitude, longitude),
    map: this.theMap,
    icon: pinImage,
    title: name 
  });

  this.markers.push(marker);
};

// Remove all pins from the map.
GMap.prototype.removePins = function() {
  _.each(this.markers, function(m) { m.setMap(null); });
};

// Load the pins and put them on the map.
GMap.prototype.loadPins = function() {
  var that = this;

  $.ajax({
    type: 'GET',
    url: 'pins',
    dataType: 'json' 
  }).done(function( data ) {
    console.log(data);
    if (data.pins) {
      that.markers.length = 0;
      var pins = data.pins;
      _.each(pins, function(pin) { that.putPin(pin); });
    }
    else if (data.error) {
      console.log(data.error);
    } 
    else {
      console.log('* empty response *');
    }
  }).fail(function( data ) {
    console.log('failed to get pins');
    console.log(data);
  });
};

