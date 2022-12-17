const express = require('express');

// Load environment variables
require('dotenv').config();

// Import the mongoose module
const mongoose = require("mongoose");

// Set up default mongoose connection
const mongoDB = "mongodb://127.0.0.1/books";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// create webserver and assign port
const app = express();
const port = process.env.PORT;

// parse body
app.use (express.json());
app.use(express.urlencoded({ extended: true}));

const booksRouter = require('./routers/booksRouter');
//create route
app.use("/books/", booksRouter);


// start webserver
app.listen(port, ()=> {
    console.log(`Here is Johnny! @port: ${port}`)
});
