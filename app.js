
var express = require('express'),
    app = express(),
    mongoose = require('mongoose');

require('./config/express')(app);
require('./config/routes')(app);

var port = process.env.PORT || 3000;
mongoose.connect('mongodb://localhost/mappins');
mongoose.connection.on('open', function () {
  app.listen(port);
  console.log('server started on port ' + port);
});
