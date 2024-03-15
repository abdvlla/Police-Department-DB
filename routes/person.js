const express = require("express");
const router = express.Router();
const Person = require('../models/persons');
const multer = require('multer');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const Crime = require('../models/crimes');

// Uploading Image
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single('image');

// Inserting individuals into database
router.post('/citizens/add', upload, async (req, res) => {
    try {
        if (!req.file) {
            throw new Error("Image is required");
        }

        const person = new Person({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            sex: req.body.sex,
            phoneNumber: req.body.phoneNumber,
            address: {
                street: req.body['address.street'],
                city: req.body['address.city'],
                state: req.body['address.state'],
            },
            dateOfBirth: new Date(req.body.dateOfCrime),
            nationality: req.body.nationality,
            image: req.file.filename,
            occupation: req.body.occupation,
            maritalStatus: req.body.maritalStatus,
            race: req.body.race,
            height: req.body.height,
            weight: req.body.weight,
            eyeColor: req.body.eyeColor,
            emergencyContact: {
                contactFirstName: req.body['emergencyContact.contactFirstName'],
                contactLastName: req.body['emergencyContact.contactLastName'],
                contactRelation: req.body['emergencyContact.contactRelation'],
                contactNumber: req.body['emergencyContact.contactNumber'],
            },
        });

        await person.save();

        req.session.message = {
            type: 'success',
            message: 'User added successfully'
        };
        res.redirect('/citizens'); // Redirect user to the home page
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


// Index page

router.get('/citizens', (req, res) => {
    Person.find().exec()
        .then((persons) => {
            res.render('persons/index', {
                title: 'All Individuals',
                persons: persons,
            });
        })
        .catch((err) => {
            res.json({ message: err.message });
        });
});

// Add individuals route

router.get('/citizens/add',(req, res) => {
    res.render('persons/add_persons', { title: 'Add Individuals' });
});

// Edit person

router.get('/citizens/:id/edit', (req, res) => {
    let id = req.params.id;

    Person.findById(id)
        .then(person => {
            if (!person) {
                res.redirect('/');
            } else {
                res.render('persons/edit_persons', {
                    title: 'Edit Individuals',
                    person: person,
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.redirect('/citizens');
        });
});

// Update person route

router.post('/update/:id', upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            try {
                await unlinkFile('./uploads/' + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        const updatedPerson = await Person.findByIdAndUpdate(id, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            sex: req.body.sex,
            phoneNumber: req.body.phoneNumber,
            address: {
                street: req.body['address.street'],
                city: req.body['address.city'],
                state: req.body['address.state'],
            },
            dateOfBirth: new Date(req.body.dateOfBirth),
            nationality: req.body.nationality,
            image: new_image,
            occupation: req.body.occupation,
            maritalStatus: req.body.maritalStatus,
            race: req.body.race,
            height: req.body.height,
            weight: req.body.weight,
            eyeColor: req.body.eyeColor,
            emergencyContact: {
                contactFirstName: req.body['emergencyContact.contactFirstName'],
                contactLastName: req.body['emergencyContact.contactLastName'],
                contactRelation: req.body['emergencyContact.contactRelation'],
                contactNumber: req.body['emergencyContact.contactNumber'],
            },
        });

        if (!updatedPerson) {
            return res.redirect('/citizens');
        }

        req.session.message = {
            type: 'success',
            message: 'Individual updated successfully',
        };
        res.redirect('/citizens');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Delete person route

router.get('/citizens/:id/delete', async (req, res) => {
    try {
        let id = req.params.id;
        const result = await Person.findByIdAndDelete(id);

        if (result && result.image !== '') {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log(err);
            }
        }
        req.session.message = {
            type: 'info',
            message: 'Individual deleted successfully',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});

// View individual's profile

router.get('/citizens/:id', async (req, res) => {
    try {
        const person = await Person.findById(req.params.id);
        const crimes = await Crime.find({ personId: person.id }).limit(6).exec();
        res.render('persons/profile', {
            title: 'View Profile',
            person: person,
            casesByPerson: crimes
        });
    } catch (error) {
        console.error(error);
        res.redirect('/citizens');
    }
});

// End of Person Route

module.exports = router;