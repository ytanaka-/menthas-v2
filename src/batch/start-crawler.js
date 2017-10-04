import crawler from "../crawler/crawler"

crawler.init();
console.log(`setup and init crawler..`);

const category = process.argv[2]

if(category){
  crawler.startCategory(category);
}else{
  // categoryの指定がない場合は全categoryを対象にする
  crawler.start();
}