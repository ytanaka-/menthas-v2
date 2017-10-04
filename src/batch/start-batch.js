import menthas from "./menthas-score"

const task = process.argv[2]

if(task === "attachCategory"){
  menthas.attachCategory();
}else if(task === "updateScore"){
  menthas.updateLatestScore();
}else{
  console.log("No task name. Please input a task.");
}