import request from "superagent"

class APIClient {

  getCategories(cb){
    request.get("/api/categories", (err,res)=>{
      if(err){
        return cb(err);
      }
      if(res.statusCode !== 200){
        return cb(new Error("HTTP Status Code isnt 200."))
      }
      const json = JSON.parse(res.text);
      cb(null, json.categories);
    });
  }

  getCategoryPages(category, offset = 0, cb){
    request.get(`/api/categories/${category}/pages?offset=${offset}`, (err,res)=>{
      if(err){
        return cb(err);
      }
      if(res.statusCode !== 200){
        return cb(new Error("HTTP Status Code isnt 200."))
      }
      const json = JSON.parse(res.text);
      cb(null, json.pages);
    });
  }

}

module.exports = new APIClient()