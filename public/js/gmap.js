/*jshint indent: 2,strict: true,jquery: true */
/*globals mpins: false, google: false, _: false*/

(function () {

  "use strict";

  function create(mapElement, mapCenter, pinImageUrl) {
    /*jshint validthis: true */
    return Object.create(this, {
      // an array of google markers currently on the map
      '_markers' : {
        value : []
      },
      // the google map
      '_theMap' : {
        value : new google.maps.Map(mapElement, {
          center: new google.maps.LatLng(mapCenter.lat, mapCenter.lng),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }) 
      },
      '_pinImageUrl' : {
        value : pinImageUrl
      }
    });
  }

  function putPin(pin, pinImageUrl) {
    /*jshint validthis: true */
    var name = pin.name + ', ' + pin.description;
    var longitude = pin.longitude;
    var latitude = pin.latitude;
    var pinImage = new google.maps.MarkerImage(pinImageUrl || this._pinImageUrl);
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longitude),
      map: this._theMap,
      icon: pinImage,
      title: name 
    });

    this._markers.push(marker);
  }

  function removePins() {
    /*jshint validthis: true */
    _.each(this._markers, function (m) { m.setMap(null); });
    return this._markers.splice(0, this._markers.length);
  }

  function loadPins(pinsUrl, pinImageUrl, onComplete) {
    /*jshint validthis: true */
    var that = this;

    $.ajax({
      type: 'GET',
      url: pinsUrl,
      dataType: 'json' 
    }).done(function (data) {
      if (data instanceof Array) {
        _.each(data, function (pin) { that.putPin(pin, pinImageUrl); });
        if (onComplete)
          onComplete(null, data);
      }
      else if (data) {
        if (onComplete)
          onComplete(data);
      } 
      else {
        if (onComplete)
          onComplete(pinsUrl + ' returned no data');
      }
    }).fail(function (data) {
      if (onComplete)
        onComplete(data); 
    });
  }

  mpins.gmap = {
    putPin: putPin,
    create: create,
    removePins: removePins,
    loadPins: loadPins
  };

}());

