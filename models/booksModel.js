// Require Mongoose
const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const BooksSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    title_nl:{
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    series: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
    year: {
        type: String,
        required: true,
    }
}, { toJSON: {virtuals: true} });

// Add virtual property to Book, ton include {dynamic} links
BooksSchema.virtual('_links').get(
    function() {
        return{
            self: {
                href: `${process.env.BASE_URI}:${process.env.PORT}/books/${this._id}`
            },
            collection: {
                href: `${process.env.BASE_URI}:${process.env.PORT}/books/`
            }
        }
    }
)


// Export function to create "SomeModel" model class
module.exports = mongoose.model("Book", BooksSchema);
