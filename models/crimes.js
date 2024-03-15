const mongoose = require('mongoose');
const crimeSchema = new mongoose.Schema({

    crimeType: {
        type: String,
        required: true
    },
    
    descriptionOfCrime: {
        type: String,
        required: true
    },

    personId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person', 
        required: true
    },

    officerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Officer', 
        required: true
    },

    location: {
        street: {
            type: String,
            required: true
        },
        town: {
            type: String,
            required: true
        },
    },

    dateOfCrime: {
        type: Date,
        required: true,
        default: Date.now()
    },

    status: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("Crime", crimeSchema);