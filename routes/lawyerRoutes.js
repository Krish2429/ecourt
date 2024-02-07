const express = require("express");
const router = express.Router();
const Client = require("../models/client.js");
const Lawyer = require("../models/profile.js");
const Case = require("../models/case.js");
// const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();
router.use(express.json());
const upload = multer({ dest: 'uploads/' });

//setting multer for storing files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

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


router.get('/ecourt/regLawyer', (req, res) => {
  res.render("regLawyer.ejs");
});

router.post('/ecourt/regLawyer', upload.single('lImg'), async (req, res) => {
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
  const about = req.body.lAbout;
  const password = req.body.lPassword;
  const rePassword = req.body.lRePassword;
  const img = req.file;
  if (!req.file) {
    console.log(req.file);
    return res.status(400).send('No file uploaded');
  }
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
    about: about,
    password: password,
    rePassword: rePassword,
    img: {
      data: fs.readFileSync(img.path),
      contentType: img.mimetype
    }
  }
  if (req.body.lPassword === req.body.lRePassword) {
    try {
      const result = new Lawyer(data);
      result.save();
    } catch (err) {
      console.error('Error inserting record:', err);
      res.sendFile(__dirname + "/failure.html");
    }
    // finally {
    //   // Delete the temporary file uploaded by Multer
    //   fs.unlinkSync(req.file.path);
    // }

    res.redirect("/ecourt/llogin");
  } else {
    res.sendFile(__dirname + "/failure.html");
  }
});
router.get('/image/:id', async (req, res) => {
  const lawyerId = req.params.id;

  try {
      const lawyer = await Lawyer.findById(lawyerId);
      // console.log(lawyer);
      if (!lawyer) {
          return res.status(404).send("lawyer not found");
      }

      // Set response content type based on the image content type
      res.contentType(lawyer.img.contentType);

      // Send the image data as the response
      res.send(lawyer.img.data);
  } catch (err) {
      console.error("Error retrieving image:", err);
      res.status(500).send("Internal Server Error");
  }
});



//login of lawyers
router.get('/ecourt/lLogin', (req, res) => {
    res.render("lawyerLoginPage.ejs");
});

router.post('/ecourt/lLogin', async (req, res) => {
  // res.send("received");
  // console.log(req.body);
  const barCode = req.body.BarCode;
  const password = req.body.loginPass;
  let userData = await Lawyer.findOne({id: barCode});
  if(userData){
    if(password === userData.password){
      res.redirect(`/ecourt/ldashboard/${userData._id}`);
    }else{
      res.send("Password Incorrect");
    }
  // console.log(userData);
  }else{
    res.send("Account not found");
  }
  
});


// Route to render lawyer dashboard with profile details
router.get('/ecourt/ldashboard/:id', async (req, res) => {
  try {
    const lawyerId = req.params.id;

    // Find the lawyer profile based on the provided ID
    const lawyer = await Lawyer.findById(lawyerId);
    // Fetch the ongoing and requested cases based on the lawyer's profile
    const ongoingCases = await Lawyer.findById(lawyerId).populate('acceptedCases');
    let requestedCases = await Lawyer.findById(lawyerId).populate('requestedCases');

    // Convert requestedCases to a plain JavaScript array to trigger population
    requestedCases = requestedCases.toObject();

    // Render the lawyer dashboard view with the profile details and cases
    res.render('lawyerDashboard', { lawyer, ongoingCases, requestedCases});
  } catch (error) {
    console.error("Error fetching lawyer data:", error);
    res.status(500).send("Internal Server Error");
  }
});



router.get("/ecourt/ldashboard/ongoing/:caseId/:lawyerId", async (req, res) => {
  const caseId = req.params.caseId;
  // console.log(caseId);
  const lawyerId = req.params.lawyerId;
  // console.log(caseId, lawyerId);
  // Validate caseId as a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(caseId)) {
    return res.status(400).json({ msg: "Invalid caseId" });
  }
  try {
    const caseInfo = await Case.findById(caseId);
    if (!caseInfo) {
      return res.status(404).json({ msg: "Case not found" });
    }
    const client = await Client.find({email: caseInfo.email});
    res.render("lawyerCaseOngoing.ejs", { client : client[0], caseInfo: caseInfo, lawyerId});
    
  } catch (err) {
    console.error(err.message);
  }
});
router.post("/ecourt/ldashboard/ongoing/:caseId/:lawyerId", async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const description = req.body.documentDescription; // Assuming the description is sent in the request body
    // Validate caseId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return res.status(400).json({ msg: "Invalid caseId" });
    }

    // Update the description of relatedDocuments
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { $push: { "relatedDocuments": { description: description } } },
      { new: true }
    );
    

    res.status(200).send("Requested documents info successfully");
  } catch (error) {
    console.error("Error requesting document:", error);
    res.status(500).send("Internal Server Error");
  }
});



router.get("/ecourt/ldashboard/accepted/:caseId/:lawyerId", async (req, res) => {
  const caseId = req.params.caseId;
  const lawyerId = req.params.lawyerId;
  // console.log(caseId, lawyerId);
  // Validate caseId as a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(caseId)) {
    return res.status(400).json({ msg: "Invalid caseId" });
  }
  try {
    const caseInfo = await Case.findById(caseId);
    if (!caseInfo) {
      return res.status(404).json({ msg: "Case not found" });
    }
    // console.log(caseInfo);
    const client = await Client.find({email: caseInfo.email});
    res.render("lrequestedCases.ejs", { client : client[0], caseInfo: caseInfo, lawyerId});
    
  } catch (err) {
    console.error(err.message);
  }
});
// router.post("/ecourt/ldashboard/accepted/:caseId/:lawyerId", async (req, res) => {//accept , decline(action)
//   const caseInfo = await Case.findById(caseId);
//   let action=req.body.action;
//   const lawyerId = await Lawyer.findById(lawyerId); 

//   console.log(req.body);
// });
router.post("/ecourt/ldashboard/accepted/:caseId/:lawyerId", async (req, res) => {
  const { caseId, lawyerId } = req.params;
  const action = req.body.action; // Get the action from the request body

  try {
    // Find the lawyer and the case by their IDs
    const lawyer = await Lawyer.findById(lawyerId);
    const caseInfo = await Case.findById(caseId);
    
    if (!lawyer || !caseInfo) {
      return res.status(404).send('Lawyer or Case not found');
    }

    // Find the client by email
    const client = await Client.findOne({ email: caseInfo.email });
    if (!client) {
      return res.status(404).send('Client not found');
    }

    // Check if the action is "accept"
    if (action === "accept") {
      // Remove the case from requested cases
      lawyer.requestedCases.pull(caseId);

      // Add the case to ongoing cases
      lawyer.acceptedCases.push(caseId);

      // Update client's pending and accepted requests
      client.pendingRequests.pull(caseId);
      client.acceptedRequests.push(caseId);

      
      await Case.findByIdAndUpdate(caseId, {status: `Case assigned to lawyer : ${lawyer.name}`}, {new: true});
      // caseInfo.status = `Case assigned to lawyer :${lawyer.name}`;
    } else if (action === "decline") {
      // If the action is "decline", do something else if needed
      // Remove the case from requested cases
      lawyer.requestedCases.pull(caseId);

      // Add the case to ongoing cases
      // lawyer.acceptedCases.push(caseId);
      client.pendingRequests.pull(caseId);
      await Case.findByIdAndUpdate(caseId, {status: `Case rejected by lawyer : ${lawyer.name}`}, {new: true});

    }

    // Save the changes to the lawyer document
    await lawyer.save();
    // Save changes to the client document
    await client.save();

    // Redirect to the lawyer's dashboard or any other appropriate page
    res.redirect(`/ecourt/ldashboard/${lawyerId}`);
  } catch (error) {
    console.error('Error processing lawyer action:', error);
    res.status(500).send('Internal Server Error');
  }
});







module.exports = router;



