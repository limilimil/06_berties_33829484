// Create a new router
const express = require("express");
const router = express.Router();

// Handle books routes
router.get('/search', function(req, res, next) {
    res.render('search.ejs');
});

router.get('/search-result', function (req, res, next) {
    //searching in the database
    res.send("You searched for: " + req.query.keyword);
});

router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render('list.ejs', {availableBooks:result});
    });
});

router.get('/addbook', function(req, res, next) {
    res.render('addbook.ejs');
});

router.post('/bookadded', function (req, res, next) {
    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    // execute sql query
    let newrecord = [req.body.name, req.body.price]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err);
        }
        else
            // Message sent to user
            res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price);
    });
});


// Export the router object so index.js can access it
module.exports = router;
