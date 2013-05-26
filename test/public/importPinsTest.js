(function () {
  
  function setUp() {
    /*:DOC += <div id="importPins">
      <span id='filename' data-bind='text: filename'></span>
      <span id='errorMessage' data-bind='text: errorMessage'></span>
      <div id='importModal'></div>
      <input id='fileInput' type='file' data-bind='event: { change: fileSelected }' />
      </div>*/

    this.fileReader = FileReader;

    FileReader = function() { 
      this.readAsText = function(filename) {
        this.onload({ target: { result: 'somekmlpins' } });
      }; 
    };

    // fake ajax requests
    this.xhr = sinon.useFakeXMLHttpRequest();
    var requests = [];
    this.requests = requests; 
    this.xhr.onCreate = function (req) { requests.push(req); };
   
    var gmap = { removePins: sinon.spy(), loadPins: sinon.spy() }; 
    this.vm = mpins.importPinsVM.create(gmap);
    ko.applyBindings(this.vm, document.getElementById("importPins"));
  }

  function tearDown() {
    FileReader = this.fileReader;
    this.xhr.restore();
  }

  TestCase("importPinsTest", {

    setUp: setUp,
    tearDown: tearDown,

    "test create should return object": function () {
      assertObject(this.vm);
      assert(mpins.importPinsVM.isPrototypeOf(this.vm));
    },

    "test selecting a file updates selected file and clears error message": function () {
      var file = { name: 'myfile' }; 
      this.vm.fileSelected(null, { target: { files: [file] }}); 

      assertEquals(file, this.vm.file);
      assertEquals('myfile', this.vm.filename()); 
      assertEquals('', this.vm.errorMessage());
    },

    "test successfull pins import": function() {

      // stub the modal found in knockoutjs
      $.fn.modal = sinon.spy();

      var file = { name: 'somefile' }; 
      this.vm.fileSelected(null, { target: { files: [file] }}); 
      this.vm.importPins();

      assertEquals('importKml', this.requests[0].url);
      assertEquals('POST', this.requests[0].method);

      var body = this.requests[0].requestBody;
      assertTrue('body contains "pinsKml=somekmlpins"', /pinsKml=somekmlpins/.test(body));
      assertTrue('body contains "overwrite=false"', /overwrite=false/.test(body));
      assertTrue(this.vm.working());

      var input = $('input[type="file"]')[0];

      this.requests[0].respond(
        200,
        { "Content-Type": "application/json" },
        JSON.stringify(null)
      ); 
      
      assertTrue($.fn.modal.calledOnce);
      assertTrue($.fn.modal.calledWith('hide'));
      assertTrue(this.vm.gmap.removePins.calledOnce);
      assertTrue(this.vm.gmap.loadPins.calledOnce);
      assertTrue(this.vm.gmap.loadPins.calledWith('pins', 'img/pin-red.png'));
      assertFalse(this.vm.working());
      assertNotEquals(input, $('input[type="file"]')[0]);
    },

    "test failed pins import": function() {

      var file = { name: 'somefile' }; 
      this.vm.fileSelected(null, { target: { files: [file] }}); 
      this.vm.importPins();

      assertEquals('importKml', this.requests[0].url);
      assertEquals('POST', this.requests[0].method);

      var body = this.requests[0].requestBody;
      assertTrue('body contains "pinsKml=somekmlpins"', /pinsKml=somekmlpins/.test(body));
      assertTrue('body contains "overwrite=false"', /overwrite=false/.test(body));
      assertTrue(this.vm.working());

      var input = $('input[type="file"]')[0];

      this.requests[0].respond(
        200,
        { "Content-Type": "application/json" },
        JSON.stringify({ error: 'some error' })
      ); 
      
      assertEquals('Not a valid KML file.', this.vm.errorMessage());
      assertFalse(this.vm.working());
      assertNotEquals(input, $('input[type="file"]')[0]);
    }

  });

  TestCase("importPinsTest_UI", {

    setUp: setUp,
    tearDown: tearDown,

    "test selecting file updates UI": function() {
      var file = { name: 'myfile' }; 
      this.vm.fileSelected(null, { target: { files: [file] }}); 

      assertEquals('myfile', $('#filename').html());
      assertEquals('', $('#errorMessage').html());
    },

    "test failed import shows error": function() {
      var file = { name: 'somefile' }; 
      this.vm.fileSelected(null, { target: { files: [file] }}); 
      this.vm.importPins();

      this.requests[0].respond(
        200,
        { "Content-Type": "application/json" },
        JSON.stringify({ error: 'some error' })
      ); 
      
      assertEquals('Not a valid KML file.', $('#errorMessage').html());
    },

    "test input element binding" : function() {
      this.vm.errorMessage('abc');
      $('#fileInput').trigger('change');
      assertEquals('', this.vm.errorMessage());
    },

    "test after replacing input element binding still works" : function() {
      this.vm.errorMessage('abc');
      var ctrl = $('input[type="file"]');

      ctrl.replaceWith(ctrl.val('').clone(true));

      $('#fileInput').trigger('change');
      assertEquals('', this.vm.errorMessage());
    }

  });

}());

