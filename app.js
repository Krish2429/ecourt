// app.js
const express = require("express");
require('dotenv').config();
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
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


app.get("/", (req, res) => {
    res.render("landingPage.ejs");
});
app.get("/ecourt", (req, res) => {
    res.render("landingPage.ejs");
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});