const express = require("express");
const router = express.Router();
const Lawyer = require("../models/profile.js");
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
require('dotenv').config();

async function dbConnection() {
  // await mongoose.connect(process.env.MONGO_URL);
  await mongoose.connect("mongodb://127.0.0.1:27017/ecourt");
}

dbConnection()
  .then(() => {
    console.log('Connected to Database');
  })
  .catch((err) => {
    console.log(err);
  });

// router.get('/ecourt/regClient', (req, res) => {
//   res.render("regClient.ejs");
// });
router.get('/ecourt/regLawyer', (req, res) => {
  res.render("regLawyer.ejs");
});

router.post('/ecourt/regLawyer', async (req, res) => {
  const name = req.body.lName;
  const email = req.body.lEmail;
  const contact = req.body.lContactH + req.body.lContact;
  const id = req.body.lId;
  const court = req.body.lCourt;
  const city = req.body.lCity;
  const dateOfBirth = req.body.lDate;
  const practiceAreas = req.body.lPracticeAreas;
  const experience = req.body.lExperience;
  const gender = req.body.lGender;
  const address = req.body.lAddress;
  const password = req.body.lPassword;
  const rePassword = req.body.lRePassword;
  const img = req.body.lImg;

  const data = {
    id: id,
    name: name,
    email: email,
    contact: contact,
    court: court,
    city: city,
    date: dateOfBirth,
    practiceAreas: practiceAreas,
    experience: experience,
    gender: gender,
    address: address,
    password: password,
    rePassword: rePassword,
    image: img
  }
  if (req.body.lPassword === req.body.lRePassword) {
    try {
      const result = new Lawyer(data);
      result.save();
    } catch (err) {
      console.error('Error inserting record:', err);
      res.sendFile(__dirname + "/failure.html");
    }

    res.redirect("/ecourt/dashboard");
  } else {
    res.sendFile(__dirname + "/failure.html");
  }
});

router.get('/ecourt/lLogin', (req, res) => {
    res.render("lawyerLoginPage.ejs");
});

router.post('/ecourt/lLogin', async (req, res) => {
  // res.send("received");
  // console.log(req.body);
  const barCode = req.body.BarCode;
  const password = req.body.loginPass;
  let userData=await Lawyer.findOne({id: barCode});
  if(userData){
    if(password===userData.password){
      res.send("login Succesful");
    }else{
      res.send("Password Incorrect");
    }
  // console.log(userData);
  }else{
    res.send("Account not found");
  }
  
});
router.get('/ecourt/lawyer', async (req, res) => {
  try {
    const lawyersList = await Lawyer.find({});
    // console.log("Lawyers List : ", lawyersList);
    res.render("lawyerPageHtml.ejs",  {lawyersList} );
  } catch (error) {
    console.error('Error rendering lawyer page:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/ecourt/filterLawyers', async (req, res) => {
  // console.log(req.body);
  try {
    const { city, practiceAreas, courts, experience, gender } = req.body;

    // Build a filter object based on the selected criteria
    const filter = {};
    if (city) filter.city = city;
    if (practiceAreas) filter.practiceAreas = practiceAreas;
    if (courts) filter.court = courts;
    if (experience) filter.experience = { $gte: experience }; // You may adjust this condition based on your needs
    if (gender) filter.gender = gender;
    // console.log(filter);
    // Fetch filtered lawyers from the database
    const filteredLawyers = await Lawyer.find(filter);
    // console.log(filteredLawyers);
    // Render the lawyer page with the filtered list
    res.render('lawyerPageHtml.ejs', { lawyersList: filteredLawyers });
  } catch (error) {
    console.error('Error filtering lawyers:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/ecourt/lawyer/:name', async (req, res) => {
  let { name } = req.params;
  try {
    let foundLawyer = await Lawyer.find({ name: name });
    if (foundLawyer.length === 0) {
      res.send('No lawyer with that name');
    } else {
      res.render('lawyerProfileCard', { data: foundLawyer[0] });
    }
  } catch (error) {
    console.error('Error fetching lawyer by name:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
