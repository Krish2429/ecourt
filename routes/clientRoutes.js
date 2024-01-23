const express = require("express");
const router = express.Router();
const Client = require("../models/client.js");
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



//sign up client
router.get('/ecourt/regClient', (req, res) => {
  res.render("regClient.ejs");
});

router.post('/ecourt/regClient', async (req, res) => {
    console.log(req.body);
    const name = req.body.cName;
    const email = req.body.cEmail;
    const contact = req.body.cContactH + req.body.cContact;
    const date = req.body.cDate;
    const password = req.body.cPassword;
    const rePassword = req.body.cRePassword;
  
    const data = {
      name: name,
      email: email,
      contact: contact,
      dateOfBirth: date,
      password: password,
      rePassword: rePassword
    }
    if (req.body.lPassword === req.body.lRePassword) {
      try {
        const result = new Client(data);
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



//login client
router.get('/ecourt/cLogin', (req, res) => {
    res.render("clientLoginPage.ejs");
});

router.post('/ecourt/cLogin', async (req, res) => {
  // console.log(req.body);
  const email = req.body.email;
  const password = req.body.loginPass;
  
  let userData = await Client.findOne({email: email});

  if(userData){
    if(password===userData.password){
      res.redirect("/ecourt/dashboard");
    }else{
      res.send("Password Incorrect");
    }
  }else{
    res.send("Account not found");
  }
  
});

module.exports = router;