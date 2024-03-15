const express = require("express");
const router = express.Router();
const Officer = require("../models/officers");
const Crime = require("../models/crimes");
const multer = require("multer");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

// Uploading Image
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

// Officers Routes
// Inserting Officers into database
router.post("/officers/add", upload, async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("Image is required");
    }

    const officer = new Officer({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      sex: req.body.sex,
      phoneNumber: req.body.phoneNumber,
      dateOfBirth: new Date(req.body.dateOfBirth),
      badgeNumber: req.body.badgeNumber,
      rank: req.body.rank,
      image: req.file.filename,
    });

    await officer.save();

    req.session.message = {
      type: "success",
      message: "Officer added successfully",
    };
    console.log(officer);
    res.redirect("/officers"); 
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

router.get("/officers/add", (req, res) => {
  res.render("officers/add_officers", { title: "Add Officers" });
});

// Retrieve Officers

router.get("/officers", (req, res) => {
  Officer.find()
    .exec()
    .then((officers) => {
      res.render("officers/officer_index", {
        title: "All Officers",
        officers: officers,
      });
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
});

// Officer profile

router.get('/officers/:id', async (req, res) => {
  try {
      const officer = await Officer.findById(req.params.id);
      const crimes = await Crime.find({ officerId: officer.id }).limit(6).exec();
      res.render('officers/officerProfile', {
          title: 'View Profile',
          officer: officer,
          casesByOfficer: crimes
      });
  } catch (error) {
      console.error(error);
      res.redirect('/officers');
  }
});

// Edit Officer

router.get("/officers/:id/edit", (req, res) => {
  let officerid = req.params.id;

  Officer.findById(officerid)
    .then((officer) => {
      if (!officer) {
        res.redirect("/officers");
      } else {
        res.render("officers/edit_officers", {
          title: "Edit Officers",
          officer: officer,
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/officers");
    });
});

// Update Officer route

router.post("/updateOfficer/:id", upload, async (req, res) => {
  try {
    let officerid = req.params.id;
    let new_image = "";

    if (req.file) {
      new_image = req.file.filename;
      try {
        await unlinkFile("./uploads/" + req.body.old_image);
      } catch (err) {
        console.log(err);
      }
    } else {
      new_image = req.body.old_image;
    }

    const updatedOfficer = await Officer.findByIdAndUpdate(officerid, {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      sex: req.body.sex,
      phoneNumber: req.body.phoneNumber,
      dateOfBirth: new Date(req.body.dateOfBirth),
      image: new_image,
      badgeNumber: req.body.badgeNumber,
      rank: req.body.rank,
    });

    if (!updatedOfficer) {
      return res.redirect("/officers");
    }

    req.session.message = {
      type: "success",
      message: "Officer updated successfully",
    };
    res.redirect("/officers");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

// Delete Officer route

router.get("/officers/:id/delete", async (req, res) => {
  try {
    let officerid = req.params.id;
    const result = await Officer.findByIdAndDelete(officerid);

    if (result && result.image !== "") {
      try {
        fs.unlinkSync("./uploads/" + result.image);
      } catch (err) {
        console.log(err);
      }
    }
    req.session.message = {
      type: "info",
      message: "Officer deleted successfully",
    };
    res.redirect("/officers");
  } catch (err) {
    res.json({ message: err.message });
  }
});

module.exports = router;
