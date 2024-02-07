// Schema for profiles of clients
//models client.js
const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    dateOfBirth: String,
    password: {
        type: String,
        required: true
    },
    cases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case'
    }],
    pendingRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case'
    }],
    acceptedRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case'
    }]
});

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
