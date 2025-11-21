# Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

To install and run:

npm install
node index.js

## Dotenv

This project uses the dotenv module to securely store database credentials in a .env file, keeping them out of the source code. The .env file contains variables like DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME, and is included in .gitignore so it’s never pushed to GitHub. In index.js, these variables are loaded with require('dotenv').config() and accessed via process.env to configure the database connection