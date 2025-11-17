import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b/";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (req,res)=>{
    res.render("index.ejs");
});

app.get("/new", (req,res)=>{
    res.render("entry.ejs");
});

app.get("/library", (req,res)=>{
    res.render("library.ejs");
});

app.get("/book", (req,res) =>{
    res.render("entry.ejs")
})



app.listen(port, ()=>{
    console.log(`Server started successfully at port ${port}.`)
})