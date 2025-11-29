// Create a new router
const express = require("express");
const router = express.Router();

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('/users/login'); // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

// Handle books routes
router.get('/search', function(req, res, next) {
    res.render('search.ejs');
});

router.get('/search_result', function (req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
    let keyword = '%' + req.sanitize(req.query.search_text) + '%'; // accepts partial matches
    // execute sql query
    db.query(sqlquery, keyword, (err, result) => {
        if (err) {
            next(err);
        }
        res.render('search_result.ejs', { result });
    });
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

router.get('/addbook', redirectLogin, function(req, res, next) {
    res.render('addbook.ejs');
});

router.post('/bookadded', redirectLogin, function (req, res, next) {
    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    // execute sql query
    let newrecord = [req.sanitize(req.body.name), req.sanitize(req.body.price)];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err);
        }
        else
            // Message sent to user
            res.send(' This book is added to database, name: '+ req.sanitize(req.body.name) + ' price '+ req.sanitize(req.body.price));
    });
});

router.get('/bargainbooks', function(req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20"; // query database with price restraint
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render('bargainbooks.ejs', {availableBooks:result});
    });
});

// Export the router object so index.js can access it
module.exports = router;
