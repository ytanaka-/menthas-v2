import client from "cheerio-httpcli"
import request from "request"

// 最大受信量を10MBに制限
client.set('maxDataSize', 1024 * 1024 * 10);

class WebPageClient {

  // urlからpageのmetaデータを取得
  fetch(url, callback) {
    return client.fetch(url, (err, $, res) => {
      if (err) {
        return callback(err);
      }
      // statusCodeが200でない場合はエラーを飛ばす
      if (res.statusCode !== 200) {
        return callback(new Error("URL StatusCode is not 200."));
      }

      // redirect後のurlを取得するためにres.request.hrefを使う
      // 短縮URLやリダイレクトされていると同じエントリが重複して生成されてしまう
      let page = {
        url: res.request.href,
        title: $("title").text()
      }
      if (typeof page.title === "undefined" || page.title === "") {
        return callback(new Error("Page title is empty."));
      }

      page.thumbnail = $("meta[property='og:image']").attr("content");
      // urlが/hogeのようなlocalを前提にしたものの場合は削除
      if(/^\//.test(page.thumbnail)){
        page.thumbnail = '';
      }
      
      page.site_name = $("meta[property='og:site_name']").attr("content");
      if (typeof page.site_name === "undefined" || page.site_name === "") {
        page.site_name = res.request.host;
      }
      
      let description = $("meta[property='og:description']").attr("content") || $("meta[name='description']").attr("content");
      if (description) {
        description = description.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
      }
      page.description = description

      // AMP対応していれば対象URLを取得
      page.amphtml = $("link[rel='amphtml']").attr('href');

      callback(null, page);
    });
  }

}

module.exports = new WebPageClient()