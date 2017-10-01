// categoryが更新された場合に備えてupdateの度に取得し直す
import Datastore from "@google-cloud/datastore"
import Category from "../model/category"
import Page from "../model/page"
import async from "async"
import _ from "lodash"
import moment from "moment"
moment.locale('jp');

const CURATOR_WEIGHT = 200
// 一回あたりのページ取得数
const BULK_PAGE_SIZE = 500
// 何日前までのEntityに対して更新を実施するか
const UPDATE_BEFORE = -7
// sigmoid関数のmidpoint
const CURATOR_MID_POINT = 4

class MenthasScore {

  attachCategory() {
    Category.findAll((err, categories) => {
      this.categories = categories;
      this._recursiveAttach(null);
    });
  }

  // 再帰的に処理しながらCategoryを付加していく
  _recursiveAttach(pageCursor) {
    // 指定日数前までのentityに対してcategoryを更新
    const base_date = moment().add(UPDATE_BEFORE, 'days').format();
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
    // 各カテゴリごとにpointを出して、最も高いpointを出したカテゴリを採用する
    // titleとdescriptionにカテゴリキーワードが含まれている場合だけ対象
    // カテゴリのcuratorがpickしてると1point
    // 同数の場合はpriorityの高い方とする
    // カテゴリはpriority順なので<比較の部分でpriorityが大きい方が優先される
    let tmp = {
      category: "others",
      point: 0
    };
    this.categories.forEach((category) => {
      const tags = category.tags;
      tags.forEach((tag) => {
        if (_.includes(str, tag)) {
          const _p = entity.picks.reduce((_p, pick) => {
            if (_.includes(category.curators, pick)) {
              _p++;
            }
            return _p;
          }, 0);
          if(tmp.point < _p){
            tmp.category = category.name;
            tmp.point = _p;
          }
        }
      });
    });
    return tmp.category;
  }


  updateLatestScore() {
    Category.findAll((err, categories) => {
      this.categories = categories;
      this._recursiveUpdateScore(null);
    });
  }

  _recursiveUpdateScore(pageCursor) {
    const base_date = moment().add(UPDATE_BEFORE, 'days').format();
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
        // othersの場合はpickした人数だけカウント
        _p++;
      }
      return _p;
    }, 0);
    const c = pageCategory.score_weight;
    const t = moment().diff(page.bookmark_date, 'hours');

    // 問題
    // 1pickの記事がtopに出るのは微妙
    // 2pickから出るくらいで良い
    // Curatorのweightが高いのでothersが強くなりすぎる
    const score = (this.sigmoid(p, CURATOR_MID_POINT) * CURATOR_WEIGHT + c) * 10 / ((t + 2) ^ 1.5)
    return score;
  }

  // 標準シグモイド関数 x0はmidpoint
  sigmoid(x, x0) {
    return 1 / (1 + Math.exp(-(x - x0)));
  }
}

module.exports = new MenthasScore()
