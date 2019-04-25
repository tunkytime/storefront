var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localHost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    readProducts();
});


function readProducts() {
    var query = `SELECT item_id, product_name, department_name, 
    CONCAT("$", price) AS Price, stock_quantity FROM products`;
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log(JSON.stringify(res, null, 2));
        startMenu();
    });
};

function startMenu() {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "Welcome to my store! What would you like to do?",
        choices: [
            "Shop all products",
            "Shop by category",
            "Exit"
        ]
    }).then(function (answer) {
        switch (answer.action) {
            case "Shop all products":
                shopProducts();
                break;
            case "Shop by category":
                // shopByCategory();
                break;
            case "Exit":
                connection.end();
                break;
        };
    });
};

function shopProducts() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: `What is the "item_id" of the product you would like to buy?`,
        validate: function (value) {
            if (isNaN(value) === false) {
                return true;
            }
            console.log(` Please enter a valid "item_id".`)
            return false;
        }
    }, {
        name: "qty",
        type: "input",
        message: "How many would you like to buy?",
        validate: function (value) {
            if (isNaN(value) === false) {
                return true;
            }
            console.log(" Please enter a valid number.")
            return false;
        }
    }]).then(function (answer) {
        inventoryCheck(answer.id, answer.qty);
    });
};

function inventoryCheck(id, qty) {
    var query = "SELECT * FROM products WHERE ?";
    connection.query(query, {
        item_id: id
    }, function (err, res) {
        if (err) throw err;
        if (res.stock_quantity < 1) {
            console.log("Insufficient quantity!");
        } else {
            updateQty(id, qty);
        };
    });
};

function updateQty(id, qty) {
    var query = `UPDATE products SET stock_quantity=stock_quantity-${qty} WHERE ?`;
    connection.query(query, {
        item_id: id
    }, function (err) {
        if (err) throw err;
        getTotal(id, qty);
    });
};

function getTotal(id, qty) {
    var query = "SELECT * FROM products WHERE ?";
    connection.query(query, {
        item_id: id
    }, function (err, res) {
        if (err) throw err;
        console.log(res);
    });
};