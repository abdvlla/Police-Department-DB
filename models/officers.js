const mongoose = require('mongoose');
const officerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    sex: { type: String,
        enum: [ "Male", "Female" ]
    },

    dateOfBirth: {
        type: Date,
        required: true,
        default: Date.now
    },

    phoneNumber: {
        type: String,
        required: true
    },

    badgeNumber: {
        type: String,
        required: true
    },

    rank: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Officer", officerSchema);