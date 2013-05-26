/*jshint indent: 2,strict: true,jquery: true */
/*globals mpins: false, ko: false, gmap: false, FileReader: false */

(function () {

  "use strict";

  function create(gmap) {
    /*jshint validthis: true */
    return Object.create(this, {
      'errorMessage' : {
        value : ko.observable('')
      },
      'working' : {
        value : ko.observable(false)  
      },
      'filename' : {
        value : ko.observable('no file selected') 
      },
      'overwrite' : {
        value : ko.observable(false) 
      },
      'gmap' : {
        value: gmap
      }
    });
  }

  // handle input elements change event
  function fileSelected(data, evt) {
    /*jshint validthis: true */
    this.file = evt.target.files[0];
    if (this.file)
      this.filename(this.file.name);
    this.errorMessage('');
  }

  function readFile(onLoad) {
    /*jshint validthis: true */
    if (this.file) {  
      var r = new FileReader();
      r.onload = onLoad;
      r.readAsText(this.file);
    } else { 
      this.errorMessage('Could not load file.');
    }
  }

  function importPins() {
    /*jshint validthis: true */
    this.errorMessage('');
    readFile.bind(this)(onFileLoad.bind(this));

    function onFileLoad(e) {
      var pinsKml = e.target.result;
      this.working(true);

      var that = this;
      $.ajax({
        type: "POST",
        url: "importKml",
        data: { pinsKml: pinsKml, overwrite: this.overwrite() }
      }).done(function (data) {
        if (data && data.error) {
          that.errorMessage('Not a valid KML file.');
        } 
        else {
          $('#importModal').modal('hide');
          that.gmap.removePins();
          that.gmap.loadPins('pins', 'img/pin-red.png');
        }
      }).fail(function () {
        that.errorMessage('Unable to connect.');
      }).complete(function () {
        that.working(false);
        // 'reset' the input so a change event will fire if the same file is selected twice 
        var ctrl = $('input[type="file"]');
        ctrl.replaceWith(ctrl.val('').clone(true));
      });
    }
  } 

  mpins.importPinsVM = {
    create: create,
    fileSelected: fileSelected,
    importPins: importPins
  };

}());


