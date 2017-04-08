"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _category = require("../model/category");

var _category2 = _interopRequireDefault(_category);

var _page = require("../model/page");

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var PAGE_SIZE = 25;

router.get('/categories', function (req, res) {
  _category2.default.findAllForFrontEnd(function (err, categories) {
    if (err) {
      return cb(err);
    } else {
      // @check
      //  top画面用にtopというcategoryを暫定で追加する
      categories.unshift({
        name: "top",
        title: "Top",
        description: "各カテゴリのHotNews",
        color: "#16a085"
      });
      return res.json({
        categories: categories
      });
    }
  });
});

router.get('/categories/:name/pages', function (req, res) {
  var name = req.params.name;
  var offset = req.query.offset || 0;
  if (name === "top") {
    _page2.default.fetchListByScore(PAGE_SIZE, offset, function (err, pages) {
      if (err) {
        return res.sendStatus(500);
      } else {
        return res.json({
          pages: pages
        });
      }
    });
  } else {
    _page2.default.fetchListByCategoryWithOffset(name, PAGE_SIZE, offset, function (err, pages) {
      if (err) {
        return res.sendStatus(500);
      } else {
        return res.json({
          pages: pages
        });
      }
    });
  }
});

module.exports = router;