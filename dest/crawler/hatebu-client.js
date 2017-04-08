"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cheerioHttpcli = require("cheerio-httpcli");

var _cheerioHttpcli2 = _interopRequireDefault(_cheerioHttpcli);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _xml2js = require("xml2js");

var _xml2js2 = _interopRequireDefault(_xml2js);

var _config = require("../../config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var parser = new _xml2js2.default.Parser();
var UA = _config2.default.crawler.UA;

var HatebuClient = function () {
  function HatebuClient() {
    _classCallCheck(this, HatebuClient);
  }

  _createClass(HatebuClient, [{
    key: "getEntryArray",


    // Hotエントリ or 新着からURLを抜き出す
    value: function getEntryArray(url, cb) {
      return _cheerioHttpcli2.default.fetch(url, function (err, $, res) {
        if (err) {
          return cb(err);
        }
        var array = [];
        $('.entry-link').each(function (idx, value) {
          var entry = $(value).attr('href');
          array.push(entry);
        });
        return cb(null, array);
      });
    }
  }, {
    key: "getHotentry",
    value: function getHotentry(category, cb) {
      var options = {
        url: "http://b.hatena.ne.jp/entrylist/" + category + ".rss?sort=hot",
        headers: {
          "User-Agent": UA
        }
      };
      return (0, _request2.default)(options, function (err, response, body) {
        if (err) {
          return cb(err);
        }
        parser.parseString(body, function (err, data) {
          if (err) {
            return cb(err);
          }
          if (response.statusCode !== 200) {
            return cb(new Error("URL StatusCode is not 200."));
          }
          var entrys = [];
          var items = data["rdf:RDF"].item;
          items.forEach(function (item) {
            //remove html-tags
            var description = item.description[0];
            if (description) {
              description = description.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
            }
            entrys.push({
              link: item.link[0],
              title: item.title[0],
              description: description,
              bookmark: item["hatena:bookmarkcount"][0]
            });
          });
          return cb(null, entrys);
        });
      });
    }
  }, {
    key: "getBookmarkInfo",
    value: function getBookmarkInfo(url, cb) {
      var options = {
        url: "http://b.hatena.ne.jp/entry/json/" + url,
        headers: {
          "User-Agent": UA
        }
      };
      return (0, _request2.default)(options, function (err, response, body) {
        if (err) {
          return cb(err);
        }
        if (response.statusCode !== 200) {
          return cb(new Error("URL StatusCode is not 200."));
        }
        return cb(null, body);
      });
    }

    // ブクマ数を調べる 0の場合はnullが返るらしい

  }, {
    key: "getBookmarkCount",
    value: function getBookmarkCount(url, cb) {
      var _url = "http://api.b.st-hatena.com/entry.count?url=" + url;
      return (0, _request2.default)(_url, function (err, response, body) {
        if (err) {
          return cb(err);
        }
        if (response.statusCode !== 200) {
          return cb(new Error("URL StatusCode is not 200."));
        }
        if (typeof body === "undefined" && body === null) {
          body = 0;
        }
        return cb(null, body);
      });
    }

    // output array
    // お気に入りに登録したURLとdateを配列を返す
    // offsetは20件単位で指定

  }, {
    key: "getBookmarkerURLList",
    value: function getBookmarkerURLList(name, offset, cb) {
      if (typeof name === "undefined") {
        return cb(new Error("Bookmarker Name is undefined."));
      }
      return this.getBookmarkerRSS(name, offset, function (err, result) {
        if (err) {
          return cb(err);
        }
        parser.parseString(result, function (err, data) {
          if (err) {
            return cb(err);
          }
          if (typeof data["rdf:RDF"] === "undefined" && data["rdf:RDF"] === null) {
            return cb(new Error("Not data[rdf:RDF]"));
          }
          var items = data["rdf:RDF"].item;
          var links = [];
          items.forEach(function (item) {
            links.push({
              url: item["link"][0],
              date: item["dc:date"][0]
            });
          });
          return cb(null, links);
        });
      });
    }
  }, {
    key: "getBookmarkerRSS",
    value: function getBookmarkerRSS(name, offset, cb) {
      var options = {
        url: "http://b.hatena.ne.jp/" + name + "/rss?of=" + offset,
        headers: {
          "User-Agent": UA
        }
      };
      return (0, _request2.default)(options, function (err, response, body) {
        if (err) {
          return cb(err);
        }
        if (response.statusCode !== 200) {
          return cb(new Error("URL StatusCode is not 200."));
        }
        return cb(null, body);
      });
    }
  }]);

  return HatebuClient;
}();

module.exports = new HatebuClient();