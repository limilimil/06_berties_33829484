# Create database script for Berties books

# Create the database
CREATE DATABASE IF NOT EXISTS berties_books;
USE berties_books;

# Create the tables
CREATE TABLE IF NOT EXISTS books (
    id     INT AUTO_INCREMENT,
    name   VARCHAR(50),
    price  DECIMAL(5, 2),
    PRIMARY KEY(id));

# Stores the user accounts
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(30) NOT NULL UNIQUE,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(120) NOT NULL UNIQUE,
  hashed_password CHAR(60) NOT NULL,
  PRIMARY KEY (id));

# Stores the log of login attempts 
CREATE TABLE IF NOT EXISTS login_audit (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(30),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45),
  success BOOLEAN,
  PRIMARY KEY (id));

# Create the application user
CREATE USER IF NOT EXISTS 'berties_books_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON berties_books.* TO ' berties_books_app'@'localhost';