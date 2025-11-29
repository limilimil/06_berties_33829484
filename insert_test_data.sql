# Insert data into the tables

USE berties_books;

INSERT INTO books (name, price) 
VALUES ('Brighton Rock', 20.25), 
('Brave New World', 25.00), 
('Animal Farm', 12.99);

INSERT INTO books (name, price) 
VALUES ('Slaughterhouse Five', 21.00), 
('Flowers for Algernon', 18.50), 
('The Dispossessed', 28.60), 
('The Murder of Roger Ackroyd', 15.00),
('Murder on the Orient Express', 16.00);

INSERT INTO users (username, first_name, last_name, email, hashed_password) 
VALUES ('gold', 'John', 'Smith', 'gold@smiths.com', '$2a$10$GkywyS/2KBbfTPTq6Ys4wen7WactWnDSrBuCl78/sYYM4Eja5Sn1a');

