import hatebuClient from "./hatebu-client"
import webpageClient from "./webpage-client"
import Category from "../model/category"
import Page from "../model/page"
import kue from "kue"
const queue = kue.createQueue();

class Crawler {

  start() {
    const that = this;
    kue.app.listen(5000);
    this.setQueueProcess();
    // 各categoryに対して所属するcuratorごとにbookmarkをcheckする
    Category.findAll((err, categories) => {
      if (err) {
        return console.error('Error occurred while background task', err);
      }
      const category = categories[0]
      category.curators.forEach((curator)=>{
        that.createFetchCuratorJob(curator);
      });
    });
  }

  createFetchCuratorJob(curator) {
    const that = this;
    queue.create("fetchCuratorRSS", {
      curator: curator
    }).on("complete", (links) => {
      links.forEach((link) => {
        that.createFetchWebpageJob(curator, link.url, link.date);
      });
    }).on("failed", (err) => {
      console.log(err);
    }).delay(1000).removeOnComplete(true).save()
  }

  createFetchWebpageJob(curator, url, date) {
    queue.create("fetchWebpage", {
      curator: curator,
      url: url,
      date: date
    }).on("complete", () => {
      console.log("complete");
    }).on("failed", (err) => {
      console.log(err);
    }).delay(1000).removeOnComplete(true).save()
  }

  setQueueProcess() {
    const that = this;
    queue.process('fetchCuratorRSS', 1, (job, done) => {
      const curator = job.data.curator;
      that.fetchCuratorRSS(curator)
        .then((links) => { done(null, links) })
        .catch((err) => { done(err) });
    });

    queue.process('fetchWebpage', 3, (job, done) => {
      const url = job.data.url;
      const curator = job.data.curator;
      const date = job.data.date;
      that.isRegistered(url, curator, date)
        .then(that.registerPage)
        .then(() => { done() })
        .catch((err) => { 
          if(err == "already picked"){
            console.log(`This Page[${url}] is already picked by curator[${curator}]`);
            done();
          }else{
            done(err);
          }
        });
    });
  }

  fetchCuratorRSS(curator) {
    return new Promise((resolve, reject) => {
      hatebuClient.getBookmarkerLinkList(curator, 0, (err, links) => {
        if (err) {
          return reject(err);
        }
        resolve(links);
      });
    });
  }

  isRegistered(url, curator, date) {
    return new Promise((resolve, reject) => {
      Page.findByUrlAndCurator(url, curator, (err, entity) => {
        if (err) {
          return reject(err);
        }
        if (entity.length !== 0) {
          return reject("already picked");
        }
        resolve({
          url: url,
          curator: curator,
          date:date
        });
      });
    });
  }

  registerPage(obj) {
    const url = obj.url;
    const curator = obj.curator;
    const date = obj.date;
    return new Promise((resolve, reject) => {
      webpageClient.fetch(url, (err, page) => {
        if (err) {
          return reject(err);
        }
        Page.findByUrl(url, (err, entity) => {
          if (err) {
            return reject(err);
          }
          // 既に登録済みの場合はcuratorをpicksに追加して保存
          if (entity) {
            if (!entity.picks.includes(curator)) {
              entity.picks.push(curator);
            }
            Page.upsert(url, entity, (err) => {
              if (err) {
                return reject(err);
              }
              return resolve();
            });
          } else {
            const data = {
              url: page.url,
              title: page.title || "",
              thumbnail: page.thumbnail || "",
              site_name: page.site_name || "",
              amphtml: page.amphtml || "",
              picks: [curator],
              category: "",
              score: 0,
              bookmark_date: date,
              description: page.description || ""
            }
            Page.upsert(url, data, (err) => {
              if (err) {
                return reject(err);
              }
              return resolve();
            });
          }
        });
      });
    });
  }
}

//module.exports = new Crawler()
const c = new Crawler();
c.start();