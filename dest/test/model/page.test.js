"use strict";

var _page = require("../../model/page");

var _page2 = _interopRequireDefault(_page);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_moment2.default.locale('jp');

/*
Page.findByUrl("http://verbhandbook.ninjal.ac.jp/", (err, entity)=>{
  if(err){
    console.log(err);
  }
  console.log(entity);
});

Page.findByUrlAndCurator("https://doxas.org/slide/frontkansai2017", "pirosikick",(err, entity)=>{
  if(err){
    console.log(err);
  }
  if(entity.length === 0){
    console.log("test")
  }
  console.log(entity);
});*/

/*
const base_date = moment().add(-2, 'days').format();
Page.fetchListByBookmarkDate(base_date, 10, null,(err, result)=>{
  if(err){
    console.log(err);
  }
  console.log(result);
})*/

_page2.default.fetchListByScore(10, function (err, result) {
  if (err) {
    console.log(err);
  }
  console.log(result);
});