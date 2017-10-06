import express from "express"
import Category from "../model/category"
import Page from "../model/page"
import RSS from "rss"
const router = express.Router();

const RSS_SIZE = 25;

router.get('/', (req, res) => {
  res.render("index", {});
});

router.get('/rss', (req, res) => {
  Page.fetchListByScore(RSS_SIZE, 0,(err, pages)=>{
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    } else {
      res.set('Content-Type', 'text/xml')
      res.send(_convertPagesToRSS("top", pages));
    }
  });
});

router.get('/:category', (req, res) => {
  const category = req.params.category
  if (category === "top") {
    return res.render("index", {});
  } else {
    _isCategoryCheck(category, (err, isCategory) => {
      if (err) {
        console.error(err);
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

router.get('/:category/rss', (req, res) => {
  const category = req.params.category
  if (category === "top") {
    return res.redirect("/rss");
  } else {
    _isCategoryCheck(category, (err, isCategory) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      } else {
        if (isCategory) {
          Page.fetchListByCategoryWithOffset(category, RSS_SIZE, 0, (err, pages) => {
            if (err) {
              return res.sendStatus(500);
            } else {
              res.set('Content-Type', 'text/xml')
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
const _isCategoryCheck = (category, cb) => {
  Category.findAll((err, categories) => {
    if (err) {
      return cb(err);
    }
    let isCategory = false;
    categories.forEach((_category) => {
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
}

const _convertPagesToRSS = (category, pages) => {
  const feed = new RSS({
    title: `Menthas #${category}`,
    description: 'Curated News Reader For Hackers.',
    feed_url: `http://menthas.com/${category}/rss`,
    site_url: 'http://menthas.com',
    custom_namespaces: {
      media: 'http://search.yahoo.com/mrss/'
    }
  });
  pages.forEach((page) => {
    const p = {
      title: page.title,
      description: page.description,
      url: page.url,
      date: page.bookmark_date
    }
    if (page.thumbnail) {
      p.custom_elements = [{
        media: {
          thumbnail: { _attr: { url: page.thumbnail } }
        }
      }]
    }
    feed.item(p);
  });

  return feed.xml();
}

module.exports = router