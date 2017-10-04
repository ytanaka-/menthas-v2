module.exports = {
  apps : [{
    name        : "app",
    script      : "./dest/app.js",
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
    }
  },{
    name       : "crawler",
    script     : "./dest/batch/start-crawler.js",
    cron_restart: "0 */1 * * *"
  },{
    name       : "attach-category",
    script     : "./dest/batch/start-batch.js",
    args       : "attachCategory",
    cron_restart: "*/20 * * * *"
  },{
    name       : "update-score",
    script     : "./dest/batch/start-batch.js",
    args       : "updateScore",
    cron_restart: "*/30 * * * *"
  }]
}