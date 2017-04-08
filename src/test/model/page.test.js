import Page from "../../model/page"
import moment from "moment"
moment.locale('jp');

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

Page.fetchListByScore(10, (err, result)=>{
  if(err){
    console.log(err);
  }
  console.log(result);
});