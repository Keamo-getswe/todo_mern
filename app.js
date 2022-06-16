//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

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

app.post("/", (req, res) => {

	const item = req.body.newitem;
	if (req.body.list === "Work") {
		workItems.push(item);	
		res.redirect("/work");
	} else {
		items.push(item);
		res.redirect("/");
	}

});

app.get("/work", (req, res) => {
	res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", (req, res) => {
	res.render("about");
});

app.listen(3000, () => {
	console.log("Server started on port 3000...");
});
