"use strict";

var _hatebuClient = require("../crawler/hatebu-client");

var _hatebuClient2 = _interopRequireDefault(_hatebuClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
describe("各メソッドの動作", () => {
  it("getEntryArray", () => {
    client.getEntryArray("http://b.hatena.ne.jp/ctop/it", (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log(result);
    });
  });
});*/

_hatebuClient2.default.getBookmarkerURLList("atria", 0, function (err, result) {
  if (err) {
    console.log(err);
  }
  console.log(result);
}); //import assert from "assert"