// categoryが更新された場合に備えてupdateの度に取得し直す
import Datastore from "@google-cloud/datastore"
import Category from "../model/category"
import Page from "../model/page"
import async from "async"
import _ from "lodash"
import moment from "moment"
moment.locale('jp');

const CURATOR_WEIGHT = 10
const CATEGORY_WEIGHT = 30
// 一回あたりのページ取得数
const BULK_PAGE_SIZE = 500
// 何日前までのEntityに対してScoreを更新するか
const SCORE_UPDATE_BEFORE = -5

class MenthasScore {

  attachCategory() {
    Category.findAll((err, categories) => {
      this.categories = categories;
      this._recursiveAttach(null);
    });
  }

  // 再帰的に処理しながらCategoryを付加していく
  _recursiveAttach(pageCursor) {
    // 指定日数前までのentityに対してscoreを更新していく
    const base_date = moment().add(SCORE_UPDATE_BEFORE, 'days').format();
    Page.fetchListByBookmarkDate(base_date, BULK_PAGE_SIZE, pageCursor, (err, entities, info) => {
      if (err) {
        console.log(err);
        return;
      }
      if (entities.length === 0) {
        console.log("Page not found.");
        return
      }

      async.each(entities, (entity, cb) => {
        entity.category = this._classifyCategory(entity);
        Page.upsert(entity.url, entity, (err)=>{
          if(err){
            cb(err);
          }else{
            cb();
          }
        });
      }, (err) => {
        if (err) {
          console.log(err);
        }
        // cursorが最後にいくまで再帰
        if (info.moreResults !== Datastore.NO_MORE_RESULTS) {
          this._recursiveAttach(info.endCursor);
        }
      });
    })
  }

  _classifyCategory(entity) {
    const str = entity.title + entity.description;
    let name = "others";
    this.categories.forEach((category) => {
      const tags = category.tags;
      tags.forEach((tag) => {
        if (_.includes(str, tag)) {
          name = category.name;
          return
        }
      });
    });
    return name;
  }


  updateLatestScore() {
    Category.findAll((err, categories) => {
      this.categories = categories;
      this._recursiveUpdateScore(null);
    });
  }

  // 再帰的に処理しながらCategoryを付加していく
  _recursiveUpdateScore(pageCursor) {
    const base_date = moment().add(SCORE_UPDATE_BEFORE, 'days').format();
    Page.fetchListByBookmarkDate(base_date, BULK_PAGE_SIZE, pageCursor, (err, entities, info) => {
      if (err) {
        console.log(err);
        return;
      }
      if (entities.length === 0) {
        console.log("Page not found.");
        return
      }

      async.each(entities, (entity, cb) => {
        // categoryがまだ未分類の場合は次に回す
        // datastoreのqueryでnot-equalが使えないので暫定処置
        if(entity.category == ""){
          return cb();
        }
        entity.score = this._calcScore(entity);
        Page.upsert(entity.url, entity, (err)=>{
          if(err){
            return cb(err);
          }else{
            cb();
          }
        });
      }, (err) => {
        if (err) {
          console.log(err);
        }
        // cursorが最後にいくまで再帰
        if (info.moreResults !== Datastore.NO_MORE_RESULTS) {
          this._recursiveUpdateScore(info.endCursor);
        }
      });
    })
  }

  // p: 対象Categoryのキュレータが何人pickしているか
  // c: Categoryに割り当てられた重み
  // t: 最初のブクマからの経過時間
  _calcScore(page) {
    // pageのcategoryに対応したCategoryModelのobject
    const pageCategory = this.categories.find((category) => {
      if (category.name == page.category) {
        return category;
      }
    });
    const p = page.picks.reduce((_p, pick) => {
      if (_.includes(pageCategory.curators, pick)) {
        _p++;
      } else if(page.category == "others"){
        // othersの場合はpickした人数だけカウント(暫定)
        _p++;
      }
      return _p;
    }, 0);
    const c = pageCategory.score_weight;
    const t = moment().diff(page.bookmark_date, 'hours');
    const score = (p * 25 + c) * 10 / (t + 2) ^ 1.5
    return score;
  }
}

//module.exports = new MenthasScore()

const m = new MenthasScore()
m.updateLatestScore();
//m.attachCategory();