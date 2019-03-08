const mongoose = require('mongoose');
const random = require('mongoose-simple-random');

const ListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    photos: [{
        path: {
            type: String,
        },
        _id: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    whid: {
        type: String
    },
    price: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    _id: {
        type: mongoose.Schema.Types.ObjectId
    }
});

ListSchema.plugin(random);

const Listing = mongoose.model('Listing', ListSchema);

module.exports = Listing;
