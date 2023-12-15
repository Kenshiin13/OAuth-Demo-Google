const express = require('express');
const router = express.Router();


router.get("/", (req, res) =>
{
    const { name } = req.query;

    res.send(`Welcome ${name || 'User'} to your profile page!`);
});



module.exports = router;