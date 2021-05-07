//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-sumit:Sumit123@cluster0.d99cp.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true});

const itemsSchema = new mongoose.Schema({
name:String
});

const Item = mongoose.model("Item",itemsSchema);
//Item singular version par database mai collection name Items banega

const item1 = new Item({
  name:"Welcome to your TOdO List"
});


const item2 = new Item({
  name:"have a great coding dear"
});


const item3 = new Item({
  name:"hope you and your family is safe"
});


const defaultItems = [item1 , item2 , item3];


const listSchema = new mongoose.Schema(
  {
    name:String,
    items:[itemsSchema]
  });

  const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {


  Item.find({},function(err,foundItems)
  // console.log(foundItems);

{
  if(foundItems.length === 0)
  {

    Item.insertMany(defaultItems,function(err){
      if(err)
      {
        console.log(err);
      }
    else
    {
        console.log("successfullyy loaded the data into default database");
    }
    });

    res.redirect("/");
  }
  else
  {

    const day = date.getDate();
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }


});

});


app.get("/:customListName",function(req,res)
{
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList) //foundList mai ek document aayega agr millla toh agr exist ni krti soo,, yh if chalega create new
      {
        // console.log("does not exist document");
        //create a new List
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else
      {
        // console.log("Exists ");
        //show an existing list
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})

      }
    }

  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  //yehh itemName text mai aaya haiii(humne form se post request daali soo noow,,
  //isko document mai change and then database mai add)...
    const item = new Item({
      name:itemName
    });


    if(listName === "Today")
    {
      item.save(); //save this document item into collecton Item.
      res.redirect("/");
    }
    else
    {
      List.findOne({name:listName},function(err,foundList){ //foundList is array ko item.so usme push.(document)
          //foundList ke items mai gye items array haiii means document haii usme push
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      });


    }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err)
  {
    if(err)
    {
      console.log(err);
    }
    else{
      console.log("removed successfully document from collection");
      res.redirect("/");

    }
  });

  }
  else
  {
    //{name:listName} List collection maii listName ka jo bhi document hoga vo select
    //phr vo pull from items array aur vo jiski id hai checkedItemId and checkedItemId update by _id and now ispe laga hua hai toh dlt
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }

    });

  }


});





app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
