/*jshint indent: 2, strict: true*/

var mpins = (function () {

  "use strict";

  function namespace(string) {

    /*jshint validthis: true */
    var object = this,
        levels = string.split(".");

    for (var i = 0, l = levels.length; i < l; i++) {
      if (typeof object[levels[i]] == "undefined") {
        object[levels[i]] = {};
      }

      object = object[levels[i]];
    }

    return object;
  }

  return {
    namespace: namespace
  };

}());

