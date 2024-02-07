const mongoose = require("mongoose");
require('dotenv').config();
const Lawyer = require("./models/profile.js");

async function dbConnection() {
  await mongoose.connect("mongodb://127.0.0.1:27017/lawyers");
}
dbConnection()
    .then(() => {
        console.log('Connected to Database');
    })
    .catch((err) => {
        console.log(err);
    });

const sampleLawyers = [
  {
    name: 'jishnu',
    typeOfLawyer: 'Criminal',
    about: 'Experienced attorneys devoted to championing justice and delivering personalized legal guidance.',
    address: 'Kukatpally, Hyderabad, Telangana.',
    phoneNo: '99999 99999',
    email: 'jishnu@.gmailcom',
    img: 'https://images.unsplash.com/photo-1549068106-b024baf5062d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
    __v: 0
  },
  {
    name: 'nikhil',
    typeOfLawyer: 'Civil',
    about: 'Experienced attorneys devoted to championing justice and delivering personalized legal guidance.',
    address: 'Uppal, Hyderabad, Telangana.',
    phoneNo: '8888888888',
    email: ' nikhil@.gmailcom',
    img: 'https://images.unsplash.com/photo-1549068106-b024baf5062d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
    __v: 0
  },
  {
    name: 'Medhas',
    typeOfLawyer: 'Criminal',
    about: 'Experienced attorneys devoted to championing justice and delivering personalized legal guidance.',
    address: 'Nagole, Hyderabad, Telangana.',
    phoneNo: '7777777777',
    email: 'medhas@.gmailcom',
    img: 'https://images.unsplash.com/photo-1549068106-b024baf5062d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
    __v: 0
  },
  {
    name: 'akshara',
    typeOfLawyer: 'Civil',
    about: 'Experienced attorneys devoted to championing justice and delivering personalized legal guidance.',
    address: 'L.B Nagar, Hyderabad, Telangana.',
    phoneNo: '6666666666',
    email: ' akshara@.gmailcom',
    img: 'https://images.unsplash.com/photo-1549068106-b024baf5062d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
    __v: 0
  }
];

Lawyer.insertMany(sampleLawyers);

