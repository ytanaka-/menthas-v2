import Category from "../model/category"
import categoryDataSet from "../../data/categories.json"

categoryDataSet.categories.forEach((category)=>{
  const name = category.name;
  Category.upsert(name, category, (err)=>{
    if(err){
      console.log(err);
    }
  })
});