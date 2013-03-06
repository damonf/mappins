function initImportPins(gmap) {
  function ViewModel() {
    var that = this;
    that.errorMessage = ko.observable('');
    that.working = ko.observable(false);
    that.filename = ko.observable('no file selected');
    that.overwrite = ko.observable(false);

    that.fileSelected = function(data, evt) {
      that.filename(evt.target.files[0].name);
      that.errorMessage('');
    };

    that.importPins = function(data, evt) {
      that.errorMessage('');

      var file = $('input[type=file]')[0].files[0];

      if (file) {
        var r = new FileReader();
        r.onload = onFileLoad;
        r.readAsText(file);
      } else { 
        that.errorMessage('Could not load file.');
      }

      function onFileLoad(e) {
        var pinsKml = e.target.result;
        that.working(true);
        $.ajax({
          type: "POST",
          url: "importKml",
          data: { pinsKml: pinsKml, overwrite: that.overwrite() }
        }).done(function( data ) {
          if (data.error) {
            that.errorMessage('Import failed. Check the file is valid KML.');
          }
          else {
            $('#importModal').modal('hide');
            gmap.removePins();
            gmap.loadPins();
          }
        }).fail(function( data ) {
          that.errorMessage('Network error. Try again?');
        }).complete(function( data ) {
          that.working(false);
          // 'reset' the input so a change event will fire if the same file is selected twice 
          var ctrl = $('input[type="file"]');
          ctrl.replaceWith( ctrl.val('').clone( true ) );
        });
      }
    };
  }

  ko.applyBindings(new ViewModel(), $('#importModal')[0]);
}
