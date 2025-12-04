import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { Client } from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();
const API_URL = "https://covers.openlibrary.org/b/";
const connectionOptions = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : { 
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT
    };

const db = new Client(connectionOptions);


db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (req,res)=>{
    res.render("index.ejs");
});

app.get("/new", (req,res)=>{
    res.render("entry.ejs");
});

app.get("/edit", async(req,res)=>{
    const edited = req.query;
    if (edited) {
        try {
            const result = await db.query("SELECT * FROM book WHERE id = $1",[edited.id]);
            const book = result.rows[0];
             res.render("entry.ejs", {editedBook: book});
        }
        catch (err) {
            console.log(err);
        }
    }
});

app.post("/edit",async(req,res)=>{
    const data = req.body;
     try {
        const result = await db.query("UPDATE book SET name = $1, isbn = $2, rating = $3, completed_date = $4, notes = $5 WHERE id= $6",[data.bookname, data.bookisbn, data.bookrating, data.bookdate, data.booknotes, data.bookid] );
        res.redirect("/book?id="+data.bookid);
    } catch (err) {
        console.log("Error querying database", err)
    }
});

app.get("/delete",async(req,res)=>{
    const id = req.query.id;
    try {
        const result = await db.query("DELETE FROM book WHERE id=$1",[id]);
        res.redirect("/library");
    } catch (err) {
        console.log("Error querying database", err)
    }
});

app.get("/library", async(req,res)=>{
    try {
        const data = await db.query("SELECT * FROM book ORDER BY name ASC");
        const books = data.rows;
        res.render("library.ejs", { library : books });
    } catch (err) {
        console.log("Error querying database", err)
    }
});

app.get("/book", async(req,res) =>{
    const bookId = req.query.id;
    try {
        let result = await db.query("SELECT * FROM book WHERE id = $1",[bookId]);
        result = result.rows[0];
        res.render("entry.ejs", {book: result});
    } catch (err) {
        console.log("Error querying database", err);
    }
    
});

app.post("/post", async(req,res)=> {
    const data = req.body;
    try {
        const result = await db.query("INSERT INTO book (name, isbn, rating, completed_date, notes) VALUES ($1, $2, $3, $4, $5)",[data.bookname, data.bookisbn, data.bookrating, data.bookdate, data.booknotes]);
        res.redirect("/library");
    } catch (err){
        console.log("Error querying database",err);;
    }
});

app.post("/sort", async(req,res)=> {
    let sortChoice = req.body.selectedSort;
    switch (sortChoice) {
        case "Title":
            try {
                let data = await db.query("SELECT * FROM book ORDER BY name ASC");
                data = data.rows;
                res.render("library.ejs", {library: data, sort: sortChoice})
            } catch (err) {
                console.log("Error querying database", err);
            }
            break;
        case "Date":
            try {
                let data = await db.query("SELECT * FROM book ORDER BY completed_date DESC");
                data = data.rows;
                res.render("library.ejs", {library: data, sort: sortChoice})
            } catch (err) {
                console.log("Error querying database", err);
            }
            break;
        case "Rating":
            try {
                let data = await db.query("SELECT * FROM book ORDER BY rating DESC");
                data = data.rows;
                res.render("library.ejs", {library: data, sort: sortChoice})
            } catch (err) {
                console.log("Error querying database", err);
            }
            break;
        default:
            break;
    }
});


app.listen(port, ()=>{
    console.log(`Server started successfully at port ${port}.`)
})