const express = require('express');
const router = express.Router();

router.get('/ecourt/dashboard', (req, res) => {
    res.render('home.ejs');
});

module.exports = router;
