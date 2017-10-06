import express from "express"
import Category from "../model/category"
import Page from "../model/page"
const router = express.Router();

const PAGE_SIZE = 48;

router.get('/categories', (req, res) => {
  Category.findAllForFrontEnd((err, categories) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
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


router.get('/categories/:name/pages', (req, res) => {
  const name = req.params.name;
  let offset = 0;
  if (Number.isInteger(Number(req.query.offset))) {
    offset = Number(req.query.offset);
  }
  if (name === "top") {
    Page.fetchListByScore(PAGE_SIZE, offset, (err, pages) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      } else {
        return res.json({
          pages: pages
        });
      }
    });
  } else {
    Page.fetchListByCategoryWithOffset(name, PAGE_SIZE, offset, (err, pages) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      } else {
        return res.json({
          pages: pages
        });
      }
    });
  }
});

module.exports = router