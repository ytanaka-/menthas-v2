"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cheerioHttpcli = require("cheerio-httpcli");

var _cheerioHttpcli2 = _interopRequireDefault(_cheerioHttpcli);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebPageClient = function () {
  function WebPageClient() {
    _classCallCheck(this, WebPageClient);
  }

  _createClass(WebPageClient, [{
    key: "fetch",


    // urlからpageのmetaデータを取得
    value: function fetch(url, callback) {
      return _cheerioHttpcli2.default.fetch(url, function (err, $, res) {
        if (err) {
          return callback(err);
        }
        // statusCodeが200でない場合はエラーを飛ばす
        if (res.statusCode !== 200) {
          return callback(new Error("URL StatusCode is not 200."));
        }
        var page = {
          url: url,
          title: $("title").text()
        };
        if (typeof page.title === "undefined" || page.title === "") {
          return callback(new Error("Page title is empty."));
        }

        page.thumbnail = $("meta[property='og:image']").attr("content");
        page.site_name = $("meta[property='og:site_name']").attr("content");
        var description = $("meta[property='og:description']").attr("content") || $("meta[name='description']").attr("content");
        if (description) {
          description = description.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
        }
        page.description = description;

        // AMP対応していれば対象URLを取得
        page.amphtml = $("link[rel='amphtml']").attr('href');

        callback(null, page);
      });
    }
  }]);

  return WebPageClient;
}();

module.exports = new WebPageClient();