const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
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
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    _id: {
        type: mongoose.Schema.Types.ObjectId
    }
});

const Listing = mongoose.model('Listing', ListSchema);

module.exports = Listing;