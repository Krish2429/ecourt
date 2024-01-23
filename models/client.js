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
    },
    dateOfBirth: {
        type: String,
    },
    password: {
        type: String,
        required: true
    }
});

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
