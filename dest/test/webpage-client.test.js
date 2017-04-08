"use strict";

var _webpageClient = require("../crawler/webpage-client");

var _webpageClient2 = _interopRequireDefault(_webpageClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_webpageClient2.default.fetch("https://cloud.google.com/nodejs/getting-started/hello-world", function (err, result) {
  if (err) {
    console.log(err);
  }
  console.log(result);
}); //import assert from "assert"