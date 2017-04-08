"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hatebuClient = require("./hatebu-client");

var _hatebuClient2 = _interopRequireDefault(_hatebuClient);

var _webpageClient = require("./webpage-client");

var _webpageClient2 = _interopRequireDefault(_webpageClient);

var _pubsub = require("@google-cloud/pubsub");

var _pubsub2 = _interopRequireDefault(_pubsub);

var _config = require("../../config");

var _config2 = _interopRequireDefault(_config);

var _category = require("../model/category");

var _category2 = _interopRequireDefault(_category);

var _page = require("../model/page");

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var pubsubClient = (0, _pubsub2.default)({
  projectId: _config2.default.gcloud.projectId
});
// topicは作成済みである必要がある
var fetchBookmarkTopic = pubsubClient.topic(_config2.default.pubsub.fetchBookmarkTopicName);
var fetchPageTopic = pubsubClient.topic(_config2.default.pubsub.fetchPageTopicName);

var Crawler = function () {
  function Crawler() {
    _classCallCheck(this, Crawler);
  }

  _createClass(Crawler, [{
    key: "start",
    value: function start() {
      this.subscribeTopics();

      // 各categoryに対して所属するcuratorごとにbookmarkをcheckする
      _category2.default.findAll(function (err, categories) {
        if (err) {
          return console.error('Error occurred while queuing background task', err);
        }
        categories.forEach(function (category) {
          var curators = category.curators;
          curators.forEach(function (curator) {
            fetchBookmarkTopic.publish({
              curator: curator
            }, function (err) {
              if (err) {
                console.error('Error occurred while queuing background task', err);
              } else {
                console.info("FetchBookmark queued for background processing");
              }
            });
          });
        });
      });
    }

    // errorや失敗した場合も再試行はせず応答する(次のcrawlで再度処理されるため)

  }, {
    key: "subscribeTopics",
    value: function subscribeTopics() {
      var _this = this;

      fetchBookmarkTopic.subscribe('fetch-bookmark', {
        ackDeadlineSeconds: 30,
        interval: 100,
        maxInProgress: 1
      }, function (err, subscription) {
        subscription.on('message', function (message) {
          var curator = message.data.curator;
          _hatebuClient2.default.getBookmarkerURLList(curator, 0, function (err, links) {
            if (err) {
              console.error('Error occurred while queuing background task', err);
            } else {
              _this._publishFetchPage(links, curator);
            }
            setTimeout(function () {
              message.ack(function (err) {
                if (err) {
                  console.error(err);
                }
              });
            }, 1000);
          });
        });
      });

      fetchPageTopic.subscribe('fetch-page', {
        ackDeadlineSeconds: 30,
        interval: 100,
        maxInProgress: 1
      }, function (err, subscription) {
        subscription.on('message', function (message) {
          var url = message.data.url;
          var curator = message.data.curator;
          var date = message.data.date;
          _this._registerPage(url, curator, date, function (err) {
            if (err) {
              console.error('Error occurred while register page task', err);
            } else {
              console.info("Page[" + url + "] task is complete");
            }
            setTimeout(function () {
              message.ack(function (err) {
                if (err) {
                  console.error(err);
                }
              });
            }, 500);
          });
        });
      });
    }
  }, {
    key: "_publishFetchPage",
    value: function _publishFetchPage(links, curator) {
      links.forEach(function (link) {
        var url = link.url;
        var date = link.date;
        _page2.default.findByUrlAndCurator(url, curator, function (err, entity) {
          if (err) {
            console.error('Error occurred while queuing background task', err);
            return;
          }
          // urlが既に対象のcuratorにpickされている場合はskipする
          if (entity.length !== 0) {
            console.info("This Page[" + url + "] is already picked by curator[" + curator + "]");
            return;
          }
          fetchPageTopic.publish({
            url: url,
            curator: curator,
            date: date
          }, function (err) {
            if (err) {
              console.error('Error occurred while queuing background task', err);
            } else {
              console.info("FetchPage queued for background processing");
            }
          });
        });
      });
    }
  }, {
    key: "_registerPage",
    value: function _registerPage(url, curator, date, cb) {
      _webpageClient2.default.fetch(url, function (err, page) {
        if (err) {
          return cb(err);
        }
        _page2.default.findByUrl(url, function (err, entity) {
          if (err) {
            return cb(err);
          }
          // 既に登録済みの場合はcuratorをpicksに追加して保存
          if (entity) {
            if (!entity.picks.includes(curator)) {
              entity.picks.push(curator);
            }
            _page2.default.upsert(url, entity, function (err) {
              if (err) {
                return cb(err);
              }
              return cb(null);
            });
          } else {
            var data = {
              url: page.url,
              title: page.title || "",
              thumbnail: page.thumbnail || "",
              site_name: page.site_name || "",
              amphtml: page.amphtml || "",
              picks: [curator],
              category: "",
              score: 0,
              bookmark_date: date,
              description: page.description || ""
            };
            _page2.default.upsert(url, data, function (err) {
              if (err) {
                return cb(err);
              }
              return cb(null);
            });
          }
        });
      });
    }
  }]);

  return Crawler;
}();

module.exports = new Crawler();