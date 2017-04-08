import hatebuClient from "./hatebu-client"
import webpageClient from "./webpage-client"
import pubsub from "@google-cloud/pubsub"
import config from "../../config"
import Category from "../model/category"
import Page from "../model/page"

const pubsubClient = pubsub({
  projectId: config.gcloud.projectId
});
// topicは作成済みである必要がある
const fetchBookmarkTopic = pubsubClient.topic(config.pubsub.fetchBookmarkTopicName);
const fetchPageTopic = pubsubClient.topic(config.pubsub.fetchPageTopicName);


class Crawler {

  start() {
    this.subscribeTopics();

    // 各categoryに対して所属するcuratorごとにbookmarkをcheckする
    Category.findAll((err, categories) => {
      if (err) {
        return console.error('Error occurred while queuing background task', err);
      }
      categories.forEach((category) => {
        const curators = category.curators;
        curators.forEach((curator) => {
          fetchBookmarkTopic.publish({
            curator: curator
          }, (err) => {
            if (err) {
              console.error('Error occurred while queuing background task', err);
            } else {
              console.info(`FetchBookmark queued for background processing`);
            }
          });
        });
      });
    });
  }

  // errorや失敗した場合も再試行はせず応答する(次のcrawlで再度処理されるため)
  subscribeTopics() {
    fetchBookmarkTopic.subscribe('fetch-bookmark', {
      ackDeadlineSeconds: 30,
      interval: 100,
      maxInProgress: 1
    }, (err, subscription) => {
      subscription.on('message', (message) => {
        const curator = message.data.curator;
        hatebuClient.getBookmarkerURLList(curator, 0, (err, links) => {
          if (err) {
            console.error('Error occurred while queuing background task', err);
          } else {
            this._publishFetchPage(links, curator);
          }
          setTimeout(() => {
            message.ack((err) => {
              if (err) { console.error(err) }
            });
          }, 1000);
        });
      });
    });

    fetchPageTopic.subscribe('fetch-page', {
      ackDeadlineSeconds: 30,
      interval: 100,
      maxInProgress: 1
    }, (err, subscription) => {
      subscription.on('message', (message) => {
        const url = message.data.url
        const curator = message.data.curator
        const date = message.data.date
        this._registerPage(url, curator, date, (err) => {
          if (err) {
            console.error('Error occurred while register page task', err)
          } else {
            console.info(`Page[${url}] task is complete`);
          }
          setTimeout(() => {
            message.ack((err) => {
              if (err) { console.error(err) }
            });
          }, 500);
        });
      });
    });
  }

  _publishFetchPage(links, curator) {
    links.forEach((link) => {
      const url = link.url
      const date = link.date
      Page.findByUrlAndCurator(url, curator, (err, entity) => {
        if (err) {
          console.error('Error occurred while queuing background task', err);
          return
        }
        // urlが既に対象のcuratorにpickされている場合はskipする
        if (entity.length !== 0) {
          console.info(`This Page[${url}] is already picked by curator[${curator}]`);
          return
        }
        fetchPageTopic.publish({
          url: url,
          curator: curator,
          date: date
        }, (err) => {
          if (err) {
            console.error('Error occurred while queuing background task', err);
          } else {
            console.info(`FetchPage queued for background processing`);
          }
        })
      })
    });
  }

  _registerPage(url, curator, date, cb) {
    webpageClient.fetch(url, (err, page) => {
      if (err) {
        return cb(err);
      }
      Page.findByUrl(url, (err, entity) => {
        if (err) {
          return cb(err);
        }
        // 既に登録済みの場合はcuratorをpicksに追加して保存
        if (entity) {
          if (!entity.picks.includes(curator)) {
            entity.picks.push(curator);
          }
          Page.upsert(url, entity, (err) => {
            if (err) {
              return cb(err);
            }
            return cb(null);
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
              return cb(err);
            }
            return cb(null);
          });
        }
      });
    });
  }
}

module.exports = new Crawler()