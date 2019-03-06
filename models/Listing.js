const mongoose = require('mongoose');

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
            default: '../public/logo.png'
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

const Listing = mongoose.model('Listing', ListSchema);

module.exports = Listing;