"use strict";

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _serveFavicon = require("serve-favicon");

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

app.use('/', require('./controller/index'));
app.use('/api/v1/', require('./controller/api'));

app.set('views', _path2.default.join(__dirname, 'view'));
app.set('view engine', 'jade');
app.disable('x-powered-by');

app.use(_express2.default.static(_path2.default.resolve('public')));
app.use((0, _serveFavicon2.default)(__dirname + '/public/images/favicon.ico'));

var port = process.env.PORT || 3000;
app.listen(port);
console.log("server start => port:" + port);

module.exports = app;