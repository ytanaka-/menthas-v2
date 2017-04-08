import datastore from "@google-cloud/datastore"
import config from "../../config"

const ds = datastore({
  projectId: config.gcloud.projectId
});
const kind = 'Category';

class Category {

  // すでに存在している場合は渡されたdataの値でupdate
  upsert(name, data, cb) {
    const key = ds.key([kind, name]);
    const entity = {
      key: key,
      data: data
    };

    ds.save(entity, (err) => {
      if (err) {
        return cb(err);
      }
      cb(null);
    });
  }

  findByName(name, cb) {
    const key = ds.key([kind, name]);

    ds.get(key, (err, entity) => {
      if (err) {
        return cb(err);
      }
      cb(null, entity);
    });
  }

  // 全てのCategoryを取得
  findAll(cb) {
    const q = ds.createQuery([kind])
    .order('priority');

    ds.runQuery(q, (err, entities) => {
      if (err) {
        return cb(err);
      }
      cb(null, entities);
    });
  }

  // 全てのPropertyをフロントに返す必要はないので間引く
  findAllForFrontEnd(cb) {
    const q = ds.createQuery([kind])
    .order('priority')
    .select(['name', 'title', 'description', 'color']);

    ds.runQuery(q, (err, entities) => {
      if (err) {
        return cb(err);
      }
      cb(null, entities);
    });
  }
}

module.exports = new Category()