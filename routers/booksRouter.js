const express = require("express");

const router = express.Router()

const Book = require("../models/booksModel");

// middleware check header Accept
router.get(['/', '/:id'], (req, res, next) => {
    switch (req.header("Accept")) {
        case "application/json":
            next();
            break;
        default:
            res.status(415).send();
    }
});

// GET complete collection
router.get('/', async (req, res) => {
    console.log("They be GETting your books")
    try {
        let books = await Book.find();

        // Create representation for collections as requested in assignment
        let booksCollection = {
            items: books,
            _links: {
                self: {
                    href: `${process.env.BASE_URI}:${process.env.PORT}/books/`
                },
                collection: {
                    href: `${process.env.BASE_URI}:${process.env.PORT}/books/`
                }
            },
            pagination: "WIP"
        }

        res.json(booksCollection)
    } catch {
        res.status(500).send();
    }
});

// GET specific resource by id
router.get('/:id', async (req, res) => {
    console.log(`They be GETting your book: ${req.params.id}`)
    try {
        let book = await Book.findById(req.params.id);
        console.log(book)
        if (book === null) {
            res.status(404).send();
        } else {
            res.json(book);
        }
    } catch {
        res.status(404).send();
    }
});

// middleware check header Content-type
router.post('/', (req, res, next) => {
    switch (req.header("content-type")) {
        case "application/json":
            next();
            break;
        case "application/x-www-form-urlencoded":
            next();
            break;
        default:
            res.status(415).send();
    }
});

// add resource to collections: POST
router.post('/', async (req, res) => {
    console.log("They POSTed your memoir")

    let book = new Book({
        title: req.body.title,
        title_nl: req.body.title_nl,
        author: req.body.author,
        series: req.body.series,
        number: req.body.number,
        year: req.body.year
    });

    try {
        const addedBook = await book.save();
        res.status(201).json(addedBook);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
});

// DELETE specific resource by id
router.delete('/:id', async (req, res) => {
    console.log("They DELETEd your library")

    try {
        const removedBook = await Book.findByIdAndDelete({_id: req.params.id},);
        res.status(204).json(removedBook);
    } catch (err) {
        res.status(400).json({message: err});
    }
});

// update specific resource using PUT
router.put('/:id', async (req, res) => {
    console.log("PUTting different words in your mouth")

    try {
        const updatedBook = await Book.updateOne({_id: req.params.id}, {
            $set: {
                title: req.body.title,
                title_nl: req.body.title_nl,
                author: req.body.author,
                series: req.body.series,
                number: req.body.number,
                year: req.body.year
            }
        }, {runValidators: true})
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({message: err});
    }
});

// Collection Options
router.options('/', (req, res) => {
    console.log("So many characters, so many OPTIONS!")
    res.setHeader("Allow", "GET, POST, OPTIONS").send();
});

// Resource Options
router.options('/:id', (req, res) => {
    console.log("So many characters, so many OPTIONS!")
    res.setHeader("Allow", "GET, PUT, DELETE, OPTIONS").send();
});
module.exports = router;