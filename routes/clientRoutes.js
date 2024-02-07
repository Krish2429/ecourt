const express = require("express");
const router = express.Router();
const Client = require("../models/client.js");
const Lawyer = require("../models/profile.js");
const Case = require("../models/case.js");
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();
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



//sign up client
router.get('/ecourt/regClient', (req, res) => {
  res.render("regClient.ejs");
});

router.post('/ecourt/regClient', async (req, res) => {
    // console.log(req.body);
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
  
      res.redirect("/ecourt/cLogin");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
  });



//login client
router.get('/ecourt/cLogin', (req, res) => {
    res.render("clientLoginPage.ejs");
});

router.post('/ecourt/cLogin', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.loginPass;
    
    // Find the user by email
    const user = await Client.findOne({ email });

    if (!user) {
      return res.send("Account not found");
    }

    if (password !== user.password) {
      return res.send("Password Incorrect");
    }

    // If login is successful, redirect to the dashboard with the client's ID
    res.redirect(`/ecourt/dashboard/${user._id}`);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});



//client dashboard
router.get('/ecourt/dashboard/:clientId', async (req, res) => {
  // console.log(req.params);
  try {
    const clientId = req.params.clientId; // Retrieve client ID from URL parameter

    // Fetch the client details by ID
    const client = await Client.findById(clientId).populate('cases');
    // console.log(client._id);
    // Render the dashboard page with client details and cases
    res.render('home.ejs', { client: client });
  } catch (error) {
    console.error("Error fetching client data:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.get('/ecourt/ipcsections' , (req, res) => {
  res.render('ipcSections.ejs');
})



//client case details form
router.get("/ecourt/ccase/:clientId", async (req, res) => {
  const clientId = req.params.clientId; // Retrieve client ID from URL parameter

    // Fetch the client details by ID
  const client = await Client.findById(clientId);
  // console.log(client);
  res.render('caseDetails.ejs', { client });
});
router.post("/ecourt/ccase/:clientId", async(req, res) => {
  try {
    // Extract case data from request body
    const caseData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      dob: req.body.dob,
      occupation: req.body.occupation,
      gender: req.body.gender,
      emergencyContact: req.body['emergency-contact'],
      legalHistory: req.body['legal-history'],
      // relatedDocuments: req.body['related-documents'],
      caseDescription: req.body['case-description'],
      additionalComments: req.body['additional-comments']
    };
    // console.log(req.body);
    // console.log(caseData);

    const clientId = req.params.clientId;
    // Find the client document by email
    const client = await Client.findById(clientId);
    
    // Create a new case document
    const newCase = await Case.create(caseData);

    // Push the new case document into the cases array of the client document
    client.cases.push(newCase);

    // Save the updated client document
    await client.save();

    // Redirect to dashboard after successfully filing the case
    res.redirect(`/ecourt/dashboard/${clientId}`);
  } catch (error) {
    // Handle errors
    console.error("Error filing case:", error);
    res.status(500).send("Internal Server Error");
  }
});


//display client cases
router.get("/ecourt/ccaseinfo/:clientId", async (req, res) => {
  try {
    const clientId = req.params.clientId;
    // Fetch the client details by email
    const client = await Client.findById(clientId).populate({
      path: 'cases',
      populate: {
          path: 'relatedDocuments',
          model: 'Document'
      }
    });
    // console.log(client);
    
    // Render the dashboard page with client details and cases
    res.render('clientCaseInfo', {client});//, { client: client });
  } catch (error) {
    console.error("Error fetching client data:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.post("/ecourt/ccaseinfo/:clientId/:caseId/:description", upload.single('new-document'), async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const document = req.file;
    const description = req.params.description;
    // console.log(req.file);
    if (!document) {
      return res.status(400).send('No file uploaded');
    }

    const existingCase = await Case.findById(caseId);
    // console.log(existingCase);

    if (!existingCase) {
      return res.status(404).send('Case not found');
    }

    // Find the index of the related document with the matching description
    const index = existingCase.relatedDocuments.findIndex(doc => doc.description === description);
    console.log(index);
    if (index === -1) {
      return res.status(404).send('Description not found in relatedDocuments array');
    }

    // Read the file and store it in the documentData object
    const documentData = {
      data: fs.readFileSync(document.path),
      contentType: document.mimetype,
      description: description
    };

    // Update the relatedDocuments array at the specified index
    existingCase.relatedDocuments[index] = documentData;

    // Save the updated case
    await existingCase.save();
    
    res.status(200).send('Document uploaded successfully');
    // res.render("clientCaseInfo.ejs", {});
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get("/ecourt/ccaseinfo/:clientId/:caseId/:description/view", async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const description = req.params.description;

    const existingCase = await Case.findById(caseId);

    // Find the index of the related document with the matching description
    const index = existingCase.relatedDocuments.findIndex(doc => doc.description === description);

    if (index === -1) {
      return res.status(404).send('Document not found');
    }

    const document = existingCase.relatedDocuments[index];

    // Set the content type of the response
    res.contentType(document.contentType);

    // Set the content disposition to inline
    res.setHeader('Content-Disposition', 'inline');

    // Send the document data as the response
    res.send(document.data);
  } catch (error) {
    console.error("Error retrieving document:", error);
    res.status(500).send("Internal Server Error");
  }
});





router.get('/ecourt/findalawyer/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    // console.log(clientId);
    const lawyersList = await Lawyer.find({});
    
    res.render("lawyerPageHtml.ejs",  {lawyersList, clientId: clientId} );
  } catch (error) {
    console.error('Error rendering lawyer page:', error);
    res.status(500).send('Internal Server Error');
  }
});
// Route to render lawyer page with filtered list
router.post('/ecourt/filterLawyers/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId;

    // Destructure the filter criteria from the request body
    const { city, practiceAreas, courts, experience, gender } = req.body;

    // Build a filter object based on the selected criteria
    const filter = {};
    if (city) filter.city = city;
    if (practiceAreas) filter.practiceAreas = practiceAreas;
    if (courts) filter.court = courts;
    if (experience) filter.experience = { $gte: experience }; // You may adjust this condition based on your needs
    if (gender) filter.gender = gender;

    // Fetch filtered lawyers from the database
    const filteredLawyers = await Lawyer.find(filter);

    // Render the lawyer page with the filtered list and clientId
    res.render('lawyerPageHtml.ejs', { lawyersList: filteredLawyers, clientId: clientId });
  } catch (error) {
    console.error('Error filtering lawyers:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/ecourt/findalawyer/:clientId/:lawyerId', async (req, res) => {
  const clientId = req.params.clientId;
  const lawyerId = req.params.lawyerId;

  try {
    // Find the client and lawyer by their IDs
    const client = await Client.findById(clientId).populate('cases');
    const lawyer = await Lawyer.findById(lawyerId);
    const base64Image = Buffer.from(lawyer.img.data).toString('base64');
    const imageSrc = `data:${lawyer.img.contentType};base64,${base64Image}`;

    // Render the client request template with client and lawyer data
    res.render("clientRequestl.ejs", { client: client.toJSON(), lawyer: lawyer.toJSON(), imageSrc });
  } catch (error) {
    console.error('Error finding client or lawyer:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/ecourt/send-request/:clientId/:lawyerId', async (req, res) => {
  const { clientId, lawyerId } = req.params;
  const selectedCaseId = req.body.selectedCaseId;

  try {
      // Find the client and lawyer by their IDs
      const client = await Client.findById(clientId);
      const lawyer = await Lawyer.findById(lawyerId);

      // Update the client's document to indicate that the request has been sent
      client.pendingRequests.push(selectedCaseId); // Push only the caseId
      await client.save();

      // Add the selected case into the requested cases of the lawyer
      lawyer.requestedCases.push(selectedCaseId);
      await lawyer.save();

      // Redirect to the client's dashboard or any other appropriate page
      res.redirect(`/ecourt/dashboard/${clientId}`);
  } catch (error) {
      console.error('Error sending request to lawyer:', error);
      res.status(500).send('Internal Server Error');
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



module.exports = router;