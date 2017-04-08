import datastore from "@google-cloud/datastore"
import config from "../../config"

const ds = datastore({
  projectId: config.gcloud.projectId
});
const kind = 'Page';

class Page {

  // err.statusの仕様 https://cloud.google.com/datastore/docs/concepts/errors?hl=ja
  // リクエストが他と競合した場合はABORTEDが返る
  upsert(url, data, cb) {
    // Propertyは1500byteを超えてはないのでdescriptionだけ抽出してflagを付ける
    const _data = []
    Object.keys(data).forEach((key) => {
      if (key == "description") {
        _data.push({
          name: key,
          value: data[key],
          excludeFromIndexes: true
        });
      } else {
        _data.push({
          name: key,
          value: data[key]
        });
      }
    });
    const key = ds.key([kind, url]);
    const entity = {
      key: key,
      data: _data
    };
    ds.save(entity, (err) => {
      if (err) {
        return cb(err);
      }
      cb(null);
    });
  }

  findByUrl(url, cb) {
    const key = ds.key([kind, url]);

    ds.get(key, (err, entity) => {
      if (err) {
        return cb(err);
      }
      cb(null, entity);
    });
  }

  // entityが存在しない場合は[]で返るので注意
  findByUrlAndCurator(url, curatorName, cb) {
    const key = ds.key([kind, url]);
    const q = ds.createQuery([kind])
    .filter('__key__', key)
    .filter('picks', curatorName);

    ds.runQuery(q, (err, entity) => {
      if (err) {
        return cb(err);
      }
      cb(null, entity);
    });
  }

  fetchListByBookmarkDate(date, limit, pageCursor, cb) {
    let q = ds.createQuery([kind])
    .filter('bookmark_date', '>=', date)
    .limit(limit);

    if (pageCursor) {
      q = q.start(pageCursor);
    }

    ds.runQuery(q, (err, entities, info) => {
      if (err) {
        return cb(err);
      }
      cb(null, entities, info);
    });
  }

  fetchListByCategory(category, limit, pageCursor, cb) {
    let q = ds.createQuery([kind])
    .filter('category', category)
    .order('score', {
      descending: true
    })
    .limit(limit);

    if (pageCursor) {
      q = q.start(pageCursor);
    }

    ds.runQuery(q, (err, entities, info) => {
      if (err) {
        return cb(err);
      }
      cb(null, entities, info);
    });
  }

  // 以下はFrontEndAPI用
  fetchListByScore(limit, offset, cb) {
    const q = ds.createQuery([kind])
    .order('score', {
      descending: true
    })
    .limit(limit)
    .offset(offset);

    ds.runQuery(q, (err, entities) => {
      if (err) {
        return cb(err);
      }
      cb(null, entities);
    });
  }
  
  fetchListByCategoryWithOffset(category, limit, offset, cb) {
    const q = ds.createQuery([kind])
    .filter('category', category)
    .order('score', {
      descending: true
    })
    .limit(limit)
    .offset(offset);

    ds.runQuery(q, (err, entities) => {
      if (err) {
        return cb(err);
      }
      cb(null, entities);
    });
  }
}

module.exports = new Page()