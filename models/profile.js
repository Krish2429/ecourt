// Schema for profiles of lawyers
//models profile.js
const mongoose = require("mongoose");

const lawyerSchema = new mongoose.Schema({
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
    id: {
        type: String,
        unique: true,
        required: true
    },
    court: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String,
    },
    practiceAreas: {
        type: String,
        required: true,
    },
    experience: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
        // minlength: [50, "Please shorten the length"]
    },
    about: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    img: {
        data: Buffer,
        contentType: String
    },
    acceptedCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case'
    }],
    requestedCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case' // Reference to the 'Case' model
    }]
});

const Lawyer = mongoose.model("Lawyer", lawyerSchema);
module.exports = Lawyer;
