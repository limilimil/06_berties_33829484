# Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

To install and run:

npm install
node index.js

## Dotenv

This project uses the dotenv module to securely store database credentials in a .env file, keeping them out of the source code. The .env file contains variables like DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME, and is included in .gitignore so it’s never pushed to GitHub. In index.js, these variables are loaded with require('dotenv').config() and accessed via process.env to configure the database connection

## Audit
The audit feature logs every login attempt, successful or unsuccessful into the login_audit MySQL table using the auditLogin() helper function. Each entry records the username, timestamp, IP address, and whether the attempt succeeded. The /audit route retrieves all stored logs and renders them in a table within audit.ejs for easy viewing.

## Access Control
Users must be logged in to access the following pages:
* User List - Prevent unprotected access to registration data
* Audit - Prevent unauthorised access to sensitive administrative data
* Logout - Users need to login in order to logout
* Addbook & bookadded - To reduce spam and maintain content quality

## Validation
Server side validation is performed on user input for the following fields:

### Registration
* Email - Must be a valid email (e.g. xxx@xxx.com), between 5 and 120 characters
* Username - Between 5-30 characters and alphanumeric characters only
* Password - Between 8-64 characters
* First name (optional) - Between 1-50 characters and letters only
* Last name (optional) - Between 1-50 characters and letters only
Note: First and last name are not required as users that want to use basic cataloguing features should not need to input sensitive information.

### Add Books
* Name - Cannot be empty
* Price - Must be a float, cannot be 0 and a maximum number of 9999.99

## Sanitisation
Email, username, first and last name are sanitised to prevent XSS attacks. Additionally the book search results and bookadded are also sanitised to prevent this.
