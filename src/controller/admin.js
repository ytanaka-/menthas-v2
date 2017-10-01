import express from "express"
import crawler from "../crawler/crawler"
import menthas from "../batch/menthas-score"
const router = express.Router();

router.get('/crawler/start', (req, res) => {
  crawler.start();
  return res.sendStatus(200);
});

router.get('/crawler/:category/start', (req, res) => {
  const category = req.params.category
  crawler.startCategory(category);
  return res.sendStatus(200);
});

router.get('/batch/category', (req, res) => {
  menthas.attachCategory();
  return res.sendStatus(200);
});

router.get('/batch/score', (req, res) => {
  menthas.updateLatestScore();
  return res.sendStatus(200);
});


module.exports = router