"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _datastore = require("@google-cloud/datastore");

var _datastore2 = _interopRequireDefault(_datastore);

var _config = require("../../config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ds = (0, _datastore2.default)({
  projectId: _config2.default.gcloud.projectId
});
var kind = 'Page';

var Page = function () {
  function Page() {
    _classCallCheck(this, Page);
  }

  _createClass(Page, [{
    key: "upsert",


    // err.statusの仕様 https://cloud.google.com/datastore/docs/concepts/errors?hl=ja
    // リクエストが他と競合した場合はABORTEDが返る
    value: function upsert(url, data, cb) {
      // Propertyは1500byteを超えてはないのでdescriptionだけ抽出してflagを付ける
      var _data = [];
      Object.keys(data).forEach(function (key) {
        if (key == "description") {
          _data.push({
            name: key,
            value: data[key],
            excludeFromIndexes: true
          });
        } else {
          _data.push({
            name: key,
            value: data[key]
          });
        }
      });
      var key = ds.key([kind, url]);
      var entity = {
        key: key,
        data: _data
      };
      ds.save(entity, function (err) {
        if (err) {
          return cb(err);
        }
        cb(null);
      });
    }
  }, {
    key: "findByUrl",
    value: function findByUrl(url, cb) {
      var key = ds.key([kind, url]);

      ds.get(key, function (err, entity) {
        if (err) {
          return cb(err);
        }
        cb(null, entity);
      });
    }

    // entityが存在しない場合は[]で返るので注意

  }, {
    key: "findByUrlAndCurator",
    value: function findByUrlAndCurator(url, curatorName, cb) {
      var key = ds.key([kind, url]);
      var q = ds.createQuery([kind]).filter('__key__', key).filter('picks', curatorName);

      ds.runQuery(q, function (err, entity) {
        if (err) {
          return cb(err);
        }
        cb(null, entity);
      });
    }
  }, {
    key: "fetchListByBookmarkDate",
    value: function fetchListByBookmarkDate(date, limit, pageCursor, cb) {
      var q = ds.createQuery([kind]).filter('bookmark_date', '>=', date).limit(limit);

      if (pageCursor) {
        q = q.start(pageCursor);
      }

      ds.runQuery(q, function (err, entities, info) {
        if (err) {
          return cb(err);
        }
        cb(null, entities, info);
      });
    }
  }, {
    key: "fetchListByCategory",
    value: function fetchListByCategory(category, limit, pageCursor, cb) {
      var q = ds.createQuery([kind]).filter('category', category).order('score', {
        descending: true
      }).limit(limit);

      if (pageCursor) {
        q = q.start(pageCursor);
      }

      ds.runQuery(q, function (err, entities, info) {
        if (err) {
          return cb(err);
        }
        cb(null, entities, info);
      });
    }

    // 以下はFrontEndAPI用

  }, {
    key: "fetchListByScore",
    value: function fetchListByScore(limit, offset, cb) {
      var q = ds.createQuery([kind]).order('score', {
        descending: true
      }).limit(limit).offset(offset);

      ds.runQuery(q, function (err, entities) {
        if (err) {
          return cb(err);
        }
        cb(null, entities);
      });
    }
  }, {
    key: "fetchListByCategoryWithOffset",
    value: function fetchListByCategoryWithOffset(category, limit, offset, cb) {
      var q = ds.createQuery([kind]).filter('category', category).order('score', {
        descending: true
      }).limit(limit).offset(offset);

      ds.runQuery(q, function (err, entities) {
        if (err) {
          return cb(err);
        }
        cb(null, entities);
      });
    }
  }]);

  return Page;
}();

module.exports = new Page();