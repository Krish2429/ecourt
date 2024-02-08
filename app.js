// app.js
const express = require("express");
require('dotenv').config();
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const cors = require('cors');
const nm = require('nodemailer');
// process.setMaxListeners(15);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const lawyerRoutes = require('./routes/lawyerRoutes.js'); 
const clientRoutes = require('./routes/clientRoutes.js'); 
const dashboardRoutes = require('./routes/dashboardRoutes.js'); 

// Middleware to handle data parsing
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors());  
app.use(methodOverride("_method"));

// Connect to MongoDB database
// async function dbConnection() {
//     await mongoose.connect(process.env.MONGO_URL);
// }

// dbConnection()
//     .then(() => {
//         console.log('Connected to Database');
//     })
//     .catch((err) => {
//         console.log(err);
//     });

// Import routes
app.use(lawyerRoutes);
app.use(clientRoutes);
app.use(dashboardRoutes);


let savedOTPS = {};
var transporter = nm.createTransport(
    {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: 'aksharasriphani@gmail.com',
            pass: 'gkdq cmci rcro sefq'
        }
    }
);
app.post('/sendotp', (req, res) => {
    let email = req.body.email;
    let digits = '0123456789';
    let limit = 4;
    let otp = '';
    for (i = 0; i < limit; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    var options = {
        from: 'Vakil Varta <info@vakilvarta.com>',
        to: email,
        subject: "Email Verification",
        html: `<p>Enter the otp: ${otp} to verify your email address</p>`
    };
    transporter.sendMail(
        options, function (error, info) {
            if (error) {
                console.log(error);
                res.status(500).send("couldn't send")
            } else {
                savedOTPS[email] = otp;
                setTimeout(
                    () => {
                        delete savedOTPS.email
                    }, 60000
                )
                res.send("sent otp")
            }
        }
    )
})

app.post('/verify', (req, res) => {
    let otpReceived = req.body.otp;
    let email = req.body.email;
    if (savedOTPS[email] == otpReceived) {
        res.send("Verified");
    } else {
        res.status(500).send("Invalid OTP");
    }
})




app.get("/", (req, res) => {
    res.render("landingPage.ejs");
});
app.get("/ecourt", (req, res) => {
    res.render("landingPage.ejs");
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});