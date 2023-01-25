const express = require("express");

const router = express.Router()

const Book = require("../models/booksModel");

const booksURI = `${process.env.BASE_URI}:${process.env.PORT}/books/`

// middleware check header Accept
router.get(['/', '/:id'], (req, res, next) => {
    // set CORS headers for GET
    res.append("Access-Control-Allow-Origin", "*");
    res.append("Access-Control-Allow-Headers", ["Accept", "Content-Type"]);

    // check if Accept is set to application/json
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

    // log method used
    console.log("They be GETting your books");


    try {
        // Define pagination variables
        const start = parseInt(req.query.start)
        const limit = parseInt(req.query.limit)
        const totalItems = await Book.count(); //is always the count of Books
        let books
        let currentItems = totalItems;

        // set default pages
        let totalPages = 1;
        let currentPage = 1;

        // set default links
        let linkFirst = `${booksURI}?start=1&limit=${limit}`;
        let linkLast = `${booksURI}?start=1&limit=${limit}`;
        let linkPrevious = `${booksURI}?start=1&limit=${limit}`;
        let linkNext = `${booksURI}?start=1&limit=${limit}`;

        // check if start AND limit are set, otherwise we can do with defaults above.
        if (!isNaN(start) && !isNaN(limit)) {
            totalPages =
                totalItems % limit === 0
                    ? totalItems / limit
                    : Math.floor(totalItems / limit) + 1;

            // Query this page's books
            books = await Book.find().skip(start - 1).limit(limit);
            currentItems = books.length;

            // Calculate pages
            totalPages = Math.ceil(totalItems / limit);
            currentPage = Math.ceil(start / limit);

            // Calculate query strings
            let startValue = 1;
            linkFirst = `${booksURI}?start=${startValue}&limit=${limit}`;

            let lastValue = (totalItems - limit) + 1;
            linkLast = `${booksURI}?start=${lastValue}&limit=${limit}`;

            let nextValue;
            if (start + limit > totalItems) {
                nextValue = lastValue;
            } else {
                nextValue = start + limit;
            }
            linkNext = `${booksURI}?start=${nextValue}&limit=${limit}`;

            let previousValue;
            if (start - limit < 1) {
                previousValue = 1;
            } else {
                previousValue = start - limit;
            }
            linkPrevious = `${booksURI}?start=${previousValue}&limit=${limit}`;

        } else {
            // Query all books
            books = await Book.find();
        }

        // Create representation for collections as requested in assignment
        let booksCollection = {
            items: books,
            _links: {
                self: {
                    href: booksURI
                },
                collection: {
                    href: booksURI
                }
            },
            pagination: {
                currentPage: currentPage,
                currentItems: currentItems,
                totalPages: totalPages,
                totalItems: totalItems,
                _links: {
                    first: {
                        page: 1,
                        href: linkFirst
                    },
                    last: {
                        page: 1,
                        href: linkLast
                    },
                    previous: {
                        page: 1,
                        href: linkPrevious
                    },
                    next: {
                        page: 1,
                        href: linkNext
                    }
                }
            }
        }

        res.json(booksCollection)
    } catch {
        res.status(500).send();
    }
});

// GET specific resource by id
router.get('/:id', async (req, res) => {
    // log method used
    console.log(`They be GETting your book: ${req.params.id}`);

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
    // check if content-type header is set appropriately
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
    res.append("Access-Control-Allow-Origin", "*");
    res.append("Access-Control-Allow-Headers", ["Accept", "Content-Type"]);
    // log method used
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
    res.append("Access-Control-Allow-Origin", "*");
    res.append("Access-Control-Allow-Headers", ["Accept", "Content-Type"]);
    // log method used
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
    res.append("Access-Control-Allow-Origin", "*");
    res.append("Access-Control-Allow-Headers", ["Accept", "Content-Type"]);

    // log method used
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
    // log method used
    console.log("So many characters, so many OPTIONS!");

    // set CORS headers
    res.append("Access-Control-Allow-Origin", "*");
    res.append("Access-Control-Allow-Headers", ["Accept", "Content-Type"]);
    res.append("Allow", "GET, POST, OPTIONS");
    res.append("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    res.send();
});

// Resource Options
router.options('/:id', (req, res) => {
    // log method used
    console.log("So many characters, so many OPTIONS!");
    res.append("Access-Control-Allow-Origin", "*");
    res.append("Access-Control-Allow-Headers", ["Accept", "Content-Type"]);

    // set CORS headers
    res.append("Allow", "GET, PUT, DELETE, OPTIONS");
    res.append("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");

    res.send();
});

module.exports = router;