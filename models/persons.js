const mongoose = require('mongoose');
const personSchema = new mongoose.Schema({
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

    phoneNumber: {
        type: String,
        required: true
    },

    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        }
    },

    dateOfBirth: {
        type: Date,
        required: true,
        trim: true,
        default: Date.now()
    },    

    nationality: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true,
    },

    occupation: {
        type: String,
        required: true
    },

    maritalStatus: {
        type: String,
        required: true
    },

    race: {
        type: String,
        required: true
    },

    height: {
        type: String,
        required: true
    },

    weight: {
        type: String,
        required: true
    },

    eyeColor: {
        type: String,
        required: true
    },

    emergencyContact: {
        contactFirstName: {
            type: String,
            required: true
        },
        contactLastName: {
            type: String,
            required: true
        },
        contactRelation: {
            type: String,
            required: true
        },
        contactNumber: {
            type: String,
            required: true
        },
    },
});

module.exports = mongoose.model("Person", personSchema);