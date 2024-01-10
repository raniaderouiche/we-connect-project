require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.DB_URI)

const db = mongoose.connection;
db.once("open", () => {console.log("Database connected")})
db.on("error", (err) => console.log(err))

//middlewares
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(
    session({
        secret: 'mykey',
        saveUninitialized: true,
        resave: false,
    })
);

app.use(express.static('public'));
app.use(express.static('uploads'));

app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

//template engine
app.set('view engine', "ejs")

// route prefix
app.use('', require("./routes/routes"));

app.listen(PORT, ()=>{
    console.log('server started at localhost:' + PORT)
});