"use strict";

var _category = require("../model/category");

var _category2 = _interopRequireDefault(_category);

var _categories = require("../../data/categories.json");

var _categories2 = _interopRequireDefault(_categories);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_categories2.default.categories.forEach(function (category) {
  var name = category.name;
  _category2.default.upsert(name, category, function (err) {
    if (err) {
      console.log(err);
    }
  });
});