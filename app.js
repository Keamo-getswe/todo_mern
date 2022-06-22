//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const defaultItem1 = new Item({
    name: "Do the dishes"
});

const defaultItem2 = new Item({
    name: "Do the laundry"
});

const defaultItem3 = new Item({
    name: "Feed the dogs"
});

const defaultItems = [defaultItem1, defaultItem2, defaultItem3];

const listsSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listsSchema);

app.get("/", (req, res) => {
    const day = date.getDate();
    Item.find({}, (err, foundItems) => {
	if (foundItems.length === 0) {
	    Item.insertMany(defaultItems, (err) => {
    		if (err) {
		    console.log(err);
    	    	} else {
	    	    console.log("Defaults added successfully");
    	    	}
	    });
	    res.redirect("/");
	} else {
	    res.render("list", {listTitle: day, newListItems: foundItems});
	}
    });
});

app.get("/:listName", (req, res) => {
    const customListName = _.capitalize(req.params.listName);
    List.findOne({name: customListName}, (err, list) =>{
        if (err) {
	    console.log(err);
	} else {
	    if (list !== null) {
		res.render("list", {listTitle: list.name, newListItems: list.items});
	    } else {
        	const list = new List({
            	    name: customListName,
	   	    items: defaultItems
        	});
        	list.save();
		res.redirect("/" + customListName);
	    }
	}
    });
});


app.post("/", (req, res) => {

	const itemName = req.body.newitem;
	const listName = req.body.list;

	const item = new Item({
	    name: itemName
	});

	if (listName === date.getDate()) {
	    item.save();	
	    res.redirect("/");
	} else {
	    List.findOne({name: listName}, (err, list) => {
	        list.items.push(item);
		list.save();
		res.redirect("/" + listName);
	    });
	}

});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === date.getDate()) {
    	Item.findByIdAndRemove(checkedItemId, (err) => {
	    if (err) {
                console.log(err);
	    } else {
	        res.redirect("/")
	    }
        });
    } else {
	List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, list) => {
	    if (err) {
		console.log(err);
	    } else {
		res.redirect("/" + listName);
	    }
	});
    }
});

app.get("/about", (req, res) => {
	res.render("about");
});

app.listen(3000, () => {
	console.log("Server started on port 3000...");
});
