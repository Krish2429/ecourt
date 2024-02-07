const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
    name: String,
    email: String,
    address: String,
    dob: String,
    occupation: String,
    gender: String,
    emergencyContact: String,
    legalHistory: String,
    relatedDocuments: [{
        data: Buffer,
        contentType: String,
        description: {
            type: String,
            // default: ""
        }
    }],
    caseDescription: {
        type: String,
        required: true
    },
    additionalComments: {
        type: String,
        default: "None"
    },
    status: {
        type: String,
        default: "Lawyer not Assigned/Requested"
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    }
});

const Case = mongoose.model("Case", caseSchema);
module.exports = Case;
