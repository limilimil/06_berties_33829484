// Create a new router
const express = require('express');
const router = express.Router();

router.get('/books', function (req, res, next) {

    // Query database to get all the books
    let sqlquery = "SELECT * FROM books";
    let predicates = [];
    let params = [];

    // Search books by their name 
    if (req.query.search) {
        predicates.push("name LIKE ?");
        params.push('%' + req.query.search + '%');

    }

    // Filter constraint by a minimum price limit
    if (req.query.minprice) {
        predicates.push("price >= ?");
        params.push(req.query.minprice);
    }

    // Filter constraint by a maximum price limit
    if (req.query.maxprice) {
        predicates.push("price <= ?");
        params.push(req.query.maxprice);
    }

    // Combine WHERE predicates into a single statement
    if (predicates.length > 0) {
        sqlquery += " WHERE " + predicates.join(" AND ");
    }
    
    // Sort result by name or price
    if (req.query.sort) {
        if (req.query.sort === 'name') {
            sqlquery += ' ORDER BY name';
        } else if (req.query.sort === 'price') {
            sqlquery += ' ORDER BY price';
        }
    }

    // Execute the sql query
    db.query(sqlquery, params, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err);
            next(err);
        }
        else {
            res.json(result);
        }
    });
});

// Export the router object so index.js can access it
module.exports = router;
