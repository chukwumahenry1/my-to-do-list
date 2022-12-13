const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash")
const PORT = process.env.PORT || 3030;

mongoose.connect("mongodb+srv://admin-chukwuma:30465557@cluster0.h8lwvex.mongodb.net/todolistDB")
const itemsSchema = new mongoose.Schema({
  name: String,

});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

// const defaultItems = [itemOne, itemTwo, itemThree];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]

});

const List = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3];

let workItems = [];
//
// let items = ["Go to bed early", "Wake up early", "Have my breakfast"];

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.set('view engine', 'ejs');


app.get("/", function(req, res) {

  let today = new Date();
  const currentDay = today.getDay();

  let options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  };
  var day = today.toLocaleDateString("en-US", options);


  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log("err")
        } else {
          console.log("all documents were inserted successfully")
        }
      });

      res.redirect("/");


    } else {
      res.render("list", {
        listTitle: day,
        newListItems: foundItems
      });
    }

  });


});


app.get("/:newParameter", function(req, res) {
  const newParameter = _.capitalize(req.params.newParameter);

  List.findOne({
      name: newParameter
    },
    function(err, foundList) {
      if (!err) {
        if (!foundList) {
          const list = new List({
            name: newParameter,
            items: defaultItems
          });

          list.save()
          res.redirect("/" + newParameter);
        } else {
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items
          });
        }
      }
    });


});

app.post("/", function(req, res) {

  const itemName = req.body.listitem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName

  });

  if (listName === "day") {
    item.save()
    res.redirect("/")
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {

        console.log(foundList);

        foundList.items.push(item);

        foundList.save();

        res.redirect("/" + listName);



      // item.save()
      //
      // // if (req.body.list === "Work") {
      // //   workItems.push(item);
      // //   res.redirect("/work")
      // // } else {
      // //   defaultItems.push(item);
      // //   res.redirect("/")
      // // }
      //
      // res.redirect("/")
      // };

    });

  };

});

app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if (listName === "day") {
    Item.findByIdAndDelete(checkedItemId, function(err) {
      if (err) {
        console.log("err")
      } else {
        console.log("successful deletion")
      }
    })
    res.redirect("/")
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);

      }
    })
  }


})


// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//
//   });
// });

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

//
// app.listen(3000, function() {
//   console.log("this server is running on port 3000")
// });
