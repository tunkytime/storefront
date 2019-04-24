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
("weekly kit", "stickers", "15.95", "20")
("mini kit", "stickers", "15.95", "20")
("single sheet", "stickers", "15.95", "20")
("sticker album", "accessories", "14.95", "20")
("pen", "accessories", "2.50", "20")
("sticky notes", "accessories", "3.00", "20")
("tanktop", "apparel", "18.95", "20")
("t-shirt", "apparel", "24.95", "20")