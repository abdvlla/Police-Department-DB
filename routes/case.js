const express = require("express");
const router = express.Router();
const Person = require('../models/persons');
const Officer = require('../models/officers');
const Crime = require('../models/crimes');

// Create case route
// Insert individuals from officers and persons collections in the form

router.get('/cases/add', async (req, res) => {
    try {
        const persons = await Person.find().exec();
        const officers = await Officer.find().exec();

        // Pass an empty object or default values for the crime
        const defaultCrime = {
            dateOfCrime: new Date(), // Assuming you want today's date as default
            status: 'Open', // Assuming you want the default status to be 'Open'
            // Add more default properties if needed
        };

        res.render('cases/create_case', {
            title: 'Create Case',
            persons: persons,
            officers: officers,
            crime: defaultCrime, // Pass defaultCrime object to the template
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

// Post route

router.post('/cases/add', async (req, res) => {
    try {
        const crime = new Crime({
            crimeType: req.body.crimeType,
            officerId: req.body.officerId,
            personId: req.body.personId,
            descriptionOfCrime: req.body.descriptionOfCrime,
            dateOfCrime: new Date(req.body.dateOfCrime),
            status: req.body.status,
            location: {
                street: req.body['location.street'],
                town: req.body['location.town'],
            },
        });

        await crime.save();

        req.session.message = {
            type: 'success',
            message: 'Incident added successfully'
        };
        console.log(crime);
        res.redirect(`${crime.id}`);
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error adding crime case. Please try again.',
        };
        res.redirect('/cases');
    }
});

// Retrieve Cases

router.get('/cases', async (req, res) => {
    try {
        const crimes = await Crime.find()
            .populate('personId', 'firstName lastName')
            .populate('officerId', 'firstName lastName')
            .exec();

        res.render('cases/case_index', {
            title: 'All Cases',
            crimes: crimes,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Case Details

router.get('/cases/:id', (req, res) => {
    let caseid = req.params.id;

    Crime.findById(caseid)
        .populate('personId', 'firstName lastName image')
        .populate('officerId', 'firstName lastName rank badgeNumber')
        .exec()
        .then(crime => {
            if (!crime) {
                res.redirect('/cases');
            } else {
                res.render('cases/case_details', {
                    title: 'View Incident',
                    crime: crime,
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.redirect('/cases');
        });
});

// Edit Officer

router.get('/cases/:id/edit', async (req, res) => {
    let caseid = req.params.id;
    const persons = await Person.find();
    const officers = await Officer.find();

    Crime.findById(caseid)
        .populate('personId', 'firstName lastName')
        .populate('officerId', 'firstName lastName')
        .exec()
        .then(crime => {
            if (!crime) {
                return res.redirect('/cases');
            } else {
                res.render('cases/edit_cases', {
                    title: 'Edit Incident',
                    crime: crime,
                    persons: persons,
                    officers: officers,
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.redirect('/cases');
        });
});


// Update Case route

router.post('/updateCase/:id', async (req, res) => {
    try {
        let caseid = req.params.id;

        console.log('Request Body:', req.body);

        // Retrieve the existing crime data from the database
        const existingCrime = await Crime.findById(caseid);

        const updatedCrimeData = {
            crimeType: req.body.crimeType || existingCrime.crimeType,
            officerId: req.body.officerId || existingCrime.officerId,
            personId: req.body.personId || existingCrime.personId,
            descriptionOfCrime: req.body.descriptionOfCrime || existingCrime.descriptionOfCrime,
            dateOfCrime: new Date(req.body.dateOfCrime) || existingCrime.dateOfCrime,
            status: req.body.status || existingCrime.status,
            location: {
                street: req.body['location.street'] || existingCrime.location.street,
                town: req.body['location.town'] || existingCrime.location.town,
            },
        };

        // Update the crime in the database
        const updatedCrime = await Crime.findByIdAndUpdate(caseid, updatedCrimeData, { new: true });

        if (!updatedCrime) {
            return res.redirect('/cases');
        }

        req.session.message = {
            type: 'success',
            message: 'Case updated successfully',
        };
        res.redirect(`/cases/${updatedCrime.id}`);
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'danger',
            message: 'Error updating case. Please try again.',
        };
        res.redirect('/cases');
    }
});



router.get('/cases/:id/delete', async (req, res) => {
    try {
        let caseid = req.params.id;
        const result = await Crime.findByIdAndDelete(caseid);

        req.session.message = {
            type: 'info',
            message: 'Case deleted successfully',
        };
        res.redirect('/cases');
    } catch (err) {
        res.json({ message: err.message });
    }
});

module.exports = router;