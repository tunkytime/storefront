DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(30) NOT NULL,
    department_name VARCHAR(30) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT(5) NOT NULL,
    PRIMARY KEY (item_id)
);

INSERT INTO products
(product_name, department_name, price, stock_quantity)
VALUES
("Weekly Kit", "Stickers", "15.95", "20");
("Mini Kit", "Stickers", "15.95", "20"),
("Single Sheet", "Stickers", "3.00", "20"),
("Sticker Album", "Accessories", "14.95", "20"),
("Ballpoint Pen", "Accessories", "2.50", "20"),
("Sticky Notes", "Accessories", "3.00", "20"),
("Tanktop", "Apparel", "18.95", "20"),
("T-Shirt", "Apparel", "24.95", "20")