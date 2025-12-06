// Create a new router
const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect(process.env.BASE_PATH + '/users/login'); // redirect to the login page
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

router.post('/registered', 
    [
        check('email').isEmail().withMessage("Please enter a valid email address").trim().isLength({ min: 5, max: 120 }).withMessage("Email address invalid"), 
        check('username').trim().isLength({ min: 5, max: 30}).withMessage("Username must be between 5 and 30 characters").isAlphanumeric().withMessage("Username must be letters and numbers only"),
        check('password').isLength({ min: 8, max: 64}).withMessage("Password must be between 8 and 64 characters"),
        check('first').optional({ values: 'falsy' }).trim().isLength({ min: 1, max: 50 }).withMessage("First name cannot be over 50 characters").isAlpha().withMessage("Please enter letters only"),
        check('last').optional({ values: 'falsy' }).trim().isLength({ min: 1, max: 50 }).withMessage("Last name cannot be over 50 characters").isAlpha().withMessage("Please enter letters only")
    ], 
    function (req, res, next) {
        const formData = {
            first: req.sanitize(req.body.first),
            last: req.sanitize(req.body.last),
            email: req.sanitize(req.body.email),
            username: req.sanitize(req.body.username)
        };
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Retrieves relevant error messages to be displayed on the user interface
            const errorMessages = { first: [], last: [], email: [], username: [], password: [] };
            for (let i = 0; i < errors.errors.length; i++) {
                let inputField = errors.errors[i].path
                if(errorMessages[inputField]) { // Only includes error messages for existing input types
                    errorMessages[inputField].push(errors.errors[i].msg);
                }
            }
            // Loads the registration page again with error messages and previous inputs except password
            res.render('./register', { errors: errorMessages, formData: formData });
        }
        else { 
            // saving data in database
            const plainPassword = req.body.password;
            req.formData = formData;
            bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
                // Store hashed password in your database.
                let sqlquery = "INSERT INTO users (username, first_name, last_name, email, hashed_password) VALUES (?,?,?,?,?)";
                let newuser = [formData.username, formData.first, formData.last, formData.email, hashedPassword]
                db.query(sqlquery, newuser, (err, result) => {
                    if (err) {
                        next(err);
                    } else {
                        // Message sent to user
                        result = 'Hello '+ formData.first + ' '+ formData.last +' you are now registered!  We will send an email to you at ' + formData.email;
                        res.send(result);
                    }
                });
            });
        }
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

// Route for logging out
router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'/'+'>Home</a>');
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
            const errors = { username: [], email: [] };
            if (result.length) {
                // Adds the relevant error message
                result.forEach(row => {
                    if (row.username === req.body.username) errors.username.push("Username already exists");
                    if (row.email === req.body.email) errors.email.push("Email already exists");
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