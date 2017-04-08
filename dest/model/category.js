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
var kind = 'Category';

var Category = function () {
  function Category() {
    _classCallCheck(this, Category);
  }

  _createClass(Category, [{
    key: "upsert",


    // すでに存在している場合は渡されたdataの値でupdate
    value: function upsert(name, data, cb) {
      var key = ds.key([kind, name]);
      var entity = {
        key: key,
        data: data
      };

      ds.save(entity, function (err) {
        if (err) {
          return cb(err);
        }
        cb(null);
      });
    }
  }, {
    key: "findByName",
    value: function findByName(name, cb) {
      var key = ds.key([kind, name]);

      ds.get(key, function (err, entity) {
        if (err) {
          return cb(err);
        }
        cb(null, entity);
      });
    }

    // 全てのCategoryを取得

  }, {
    key: "findAll",
    value: function findAll(cb) {
      var q = ds.createQuery([kind]).order('priority');

      ds.runQuery(q, function (err, entities) {
        if (err) {
          return cb(err);
        }
        cb(null, entities);
      });
    }

    // 全てのPropertyをフロントに返す必要はないので間引く

  }, {
    key: "findAllForFrontEnd",
    value: function findAllForFrontEnd(cb) {
      var q = ds.createQuery([kind]).order('priority').select(['name', 'title', 'description', 'color']);

      ds.runQuery(q, function (err, entities) {
        if (err) {
          return cb(err);
        }
        cb(null, entities);
      });
    }
  }]);

  return Category;
}();

module.exports = new Category();