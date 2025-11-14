// Import express and ejs
const express = require ('express');
const ejs = require('ejs');
const path = require('path');
const mysql = require('mysql2');

// Create the express application object
const app = express();
const port = 8000;

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Set up the body parser 
app.use(express.urlencoded({ extended: true }));

// Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')));

// Define our application-specific data
app.locals.shopData = {shopName: "Bertie's Books"};

// Define the database connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'berties_books_app',
    password: 'qwertyuiop',
    database: 'berties_books',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
global.db = db;


// Load the route handlers
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

// Load the route handlers for /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Load the route handlers for /books
const booksRoutes = require('./routes/books');
app.use('/books', booksRoutes);

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`));