"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _category2 = require("../model/category");

var _category3 = _interopRequireDefault(_category2);

var _page = require("../model/page");

var _page2 = _interopRequireDefault(_page);

var _rss = require("rss");

var _rss2 = _interopRequireDefault(_rss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var RSS_SIZE = 25;

router.get('/', function (req, res) {
  res.render("index", {});
});

router.get('/rss', function (req, res) {
  _page2.default.fetchListByScore(RSS_SIZE, 0, function (err, pages) {
    if (err) {
      return res.sendStatus(500);
    } else {
      res.set('Content-Type', 'text/xml');
      res.send(_convertPagesToRSS("top", pages));
    }
  });
});

router.get('/:category', function (req, res) {
  var category = req.params.category;
  if (category === "top") {
    return res.render("index", {});
  } else {
    _isCategoryCheck(category, function (err, isCategory) {
      if (err) {
        return res.sendStatus(500);
      } else {
        if (isCategory) {
          return res.render("index", {
            category: category
          });
        } else {
          return res.sendStatus(404);
        }
      }
    });
  }
});

router.get('/:category/rss', function (req, res) {
  var category = req.params.category;
  if (category === "top") {
    return res.redirect("/rss");
  } else {
    _isCategoryCheck(category, function (err, isCategory) {
      if (err) {
        return res.sendStatus(500);
      } else {
        if (isCategory) {
          _page2.default.fetchListByCategoryWithOffset(category, RSS_SIZE, 0, function (err, pages) {
            if (err) {
              return res.sendStatus(500);
            } else {
              res.set('Content-Type', 'text/xml');
              res.send(_convertPagesToRSS("top", pages));
            }
          });
        } else {
          return res.sendStatus(404);
        }
      }
    });
  }
});

// private method
var _isCategoryCheck = function _isCategoryCheck(category, cb) {
  _category3.default.findAll(function (err, categories) {
    if (err) {
      return cb(err);
    }
    var isCategory = false;
    categories.forEach(function (_category) {
      if (_category.name === category) {
        isCategory = true;
      }
    });
    if (isCategory) {
      return cb(null, true);
    } else {
      return cb(null, false);
    }
  });
};

var _convertPagesToRSS = function _convertPagesToRSS(category, pages) {
  var feed = new _rss2.default({
    title: "Menthas #" + category,
    description: 'Curated News Reader For Hackers.',
    feed_url: "http://menthas.com/" + category + "/rss",
    site_url: 'http://menthas.com',
    custom_namespaces: {
      media: 'http://search.yahoo.com/mrss/'
    }
  });
  pages.forEach(function (page) {
    var p = {
      title: page.title,
      description: page.description,
      url: page.url,
      date: page.bookmark_date
    };
    if (page.thumbnail) {
      p.custom_elements = [{
        media: {
          thumbnail: { _attr: { url: page.thumbnail } }
        }
      }];
    }
    feed.item(p);
  });

  return feed.xml();
};

module.exports = router;