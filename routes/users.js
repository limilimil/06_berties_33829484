// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('./login'); // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

// Adds login attempts to the login_audit database
function auditLogin (username, ip, success){
    let sqlquery = "INSERT INTO login_audit (username, ip, success) VALUES (?,?,?)";
    db.query(sqlquery, [username, ip, success], (err, result) => {
        if(err) {
            console.error(err);
        }
    });
}

// Handle registration routes
router.get('/register', function (req, res, next) {
    res.render('register.ejs', { errors: {}, formData: {} });
});

router.post('/registered', function (req, res, next) {
    // saving data in database
    const saltRounds = 10;
    const plainPassword = req.body.password;
    const formData = {
        first: req.body.first,
        last: req.body.last,
        email: req.body.email,
        username: req.body.username
    };
    req.formData = formData;
    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        // Store hashed password in your database.
        let sqlquery = "INSERT INTO users (username, first_name, last_name, email, hashed_password) VALUES (?,?,?,?,?)";
        let newuser = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword]
        db.query(sqlquery, newuser, (err, result) => {
            if (err) {
                next(err);
            } else {
                // Message sent to user
                result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email;
                result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
                res.send(result);
            }
        });
    });
});

router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT username FROM users"; // query database to get all users
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render('listusers.ejs', {registeredUsers:result});
    });
});

router.get('/login', function (req, res, next) {
    res.render('login.ejs');
});

// Route for logging in the user
router.post('/loggedin', function (req, res, next) {
    let sqlquery = "SELECT username, hashed_password FROM users WHERE username = ?";
    db.query(sqlquery, req.body.username, (err, result) => {
        if (err) {
            auditLogin(req.body.username, req.ip, 0);
            next(err);
        } else {
            if (result.length == 0) {
                auditLogin(req.body.username, req.ip, 0);
                res.send("Login failed: Incorrect username or password");
            } else {
                const hashedPassword = result[0].hashed_password;
                bcrypt.compare(req.body.password, hashedPassword, function(err, match) {
                    if (err) {
                        auditLogin(req.body.username, req.ip, 0);
                        res.send("Error logging in. Please try again later.");
                    }
                    else if (match == true) {
                        auditLogin(req.body.username, req.ip, 1);
                        req.session.userId = req.body.username;
                        res.send("Logged in successfully");
                    }
                    else {
                        auditLogin(req.body.username, req.ip, 0);
                        res.send("Login failed: Incorrect username or password");
                    }
                });
            }
        }
    });
});

// Route for viewing the log of attempted logins
router.get('/audit', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM login_audit"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render('audit.ejs', {audit: result});
    });
});

// Handles duplicate usernames or emails database insert errors for the registered route
function dupEntryErrorHandler(err, req, res, next) {
    if(err.code === 'ER_DUP_ENTRY') { // Only handles this error
        const formData = req.formData;
        // Attempts to retrieve duplicate values
        sqlquery = "SELECT username, email FROM users WHERE username = ? OR email = ?"; 
        db.query(sqlquery, [req.body.username, req.body.email], (err, result) => {
            const errors = {};
            if (result.length) {
                // Adds the relevant error message
                result.forEach(row => {
                    if (row.username === req.body.username) errors.username = "Username already exists";
                    if (row.email === req.body.email) errors.email = "Email already exists";
                });
                // Renders the register page with the users inputs, excluding password for security
                res.render('register.ejs', {errors, formData});
            }
        });
    } else {
        next(err);
    }
}

// Middleware for the router
router.use(dupEntryErrorHandler);

// Export the router object so index.js can access it
module.exports = router;