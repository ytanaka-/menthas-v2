"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // categoryが更新された場合に備えてupdateの度に取得し直す


var _datastore = require("@google-cloud/datastore");

var _datastore2 = _interopRequireDefault(_datastore);

var _category = require("../model/category");

var _category2 = _interopRequireDefault(_category);

var _page = require("../model/page");

var _page2 = _interopRequireDefault(_page);

var _async = require("async");

var _async2 = _interopRequireDefault(_async);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_moment2.default.locale('jp');

var CURATOR_WEIGHT = 10;
var CATEGORY_WEIGHT = 30;
// 一回あたりのページ取得数
var BULK_PAGE_SIZE = 500;
// 何日前までのEntityに対してScoreを更新するか
var SCORE_UPDATE_BEFORE = -5;

var MenthasScore = function () {
  function MenthasScore() {
    _classCallCheck(this, MenthasScore);
  }

  _createClass(MenthasScore, [{
    key: "attachCategory",
    value: function attachCategory() {
      var _this = this;

      _category2.default.findAll(function (err, categories) {
        _this.categories = categories;
        _this._recursiveAttach(null);
      });
    }

    // 再帰的に処理しながらCategoryを付加していく

  }, {
    key: "_recursiveAttach",
    value: function _recursiveAttach(pageCursor) {
      var _this2 = this;

      _page2.default.fetchListByCategory("", BULK_PAGE_SIZE, pageCursor, function (err, entities, info) {
        if (err) {
          console.log(err);
          return;
        }
        if (entities.length === 0) {
          console.log("Page not found.");
          return;
        }

        _async2.default.each(entities, function (entity, cb) {
          entity.category = _this2._classifyCategory(entity);
          _page2.default.upsert(entity.url, entity, function (err) {
            if (err) {
              cb(err);
            } else {
              cb();
            }
          });
        }, function (err) {
          if (err) {
            console.log(err);
          }
          // cursorが最後にいくまで再帰
          if (info.moreResults !== _datastore2.default.NO_MORE_RESULTS) {
            _this2._recursiveAttach(info.endCursor);
          }
        });
      });
    }
  }, {
    key: "_classifyCategory",
    value: function _classifyCategory(entity) {
      var str = entity.title + entity.description;
      var name = "others";
      this.categories.forEach(function (category) {
        var tags = category.tags;
        tags.forEach(function (tag) {
          if (_lodash2.default.includes(str, tag)) {
            name = category.name;
            return;
          }
        });
      });
      return name;
    }
  }, {
    key: "updateLatestScore",
    value: function updateLatestScore() {
      var _this3 = this;

      _category2.default.findAll(function (err, categories) {
        _this3.categories = categories;
        _this3._recursiveUpdateScore(null);
      });
    }

    // 再帰的に処理しながらCategoryを付加していく

  }, {
    key: "_recursiveUpdateScore",
    value: function _recursiveUpdateScore(pageCursor) {
      var _this4 = this;

      // 指定日数前までのentityに対してscoreを更新していく
      var base_date = (0, _moment2.default)().add(SCORE_UPDATE_BEFORE, 'days').format();
      _page2.default.fetchListByBookmarkDate(base_date, BULK_PAGE_SIZE, pageCursor, function (err, entities, info) {
        if (err) {
          console.log(err);
          return;
        }
        if (entities.length === 0) {
          console.log("Page not found.");
          return;
        }

        _async2.default.each(entities, function (entity, cb) {
          // categoryがまだ未分類の場合は次に回す
          // datastoreのqueryでnot-equalが使えないので暫定処置
          if (entity.category == "") {
            cb();
          }
          entity.score = _this4._calcScore(entity);
          _page2.default.upsert(entity.url, entity, function (err) {
            if (err) {
              cb(err);
            } else {
              cb();
            }
          });
        }, function (err) {
          if (err) {
            console.log(err);
          }
          // cursorが最後にいくまで再帰
          if (info.moreResults !== _datastore2.default.NO_MORE_RESULTS) {
            _this4._recursiveUpdateScore(info.endCursor);
          }
        });
      });
    }

    // p: 対象Categoryのキュレータが何人pickしているか
    // c: Categoryに割り当てられた重み
    // t: 最初のブクマからの経過時間

  }, {
    key: "_calcScore",
    value: function _calcScore(page) {
      // pageのcategoryに対応したCategoryModelのobject
      var pageCategory = this.categories.find(function (category) {
        if (category.name == page.category) {
          return category;
        }
      });
      var p = page.picks.reduce(function (_p, pick) {
        if (_lodash2.default.includes(pageCategory.curators, pick)) {
          _p++;
        } else if (page.category == "others") {
          // othersの場合はpickした人数だけカウント(暫定)
          _p++;
        }
        return _p;
      }, 0);
      var c = pageCategory.score_weight;
      var t = (0, _moment2.default)().diff(page.bookmark_date, 'hours');
      var score = (p * 25 + c) * 10 / (t + 2) ^ 1.5;
      return score;
    }
  }]);

  return MenthasScore;
}();

module.exports = new MenthasScore();