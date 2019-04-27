var mysql = require("mysql");
var inquirer = require("inquirer");
var divider = "===========================================================";
var connection = mysql.createConnection({
    host: "localHost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(
        `${divider}\nWelcome to my store! Here's a look at available products:\n${divider}`
    );
    readProducts();
});

function readProducts() {
    var query = `SELECT item_id, product_name, department_name, 
    CONCAT("$", price) AS Price, stock_quantity FROM products`;
    connection.query(query, function (err, res) {
        if (err) throw err;
        displayProducts(res);
        startMenu();
    });
}

function displayProducts(res) {
    console.log();
    for (var i = 0; i < res.length; i++) {
        var id = res[i].item_id;
        var name = res[i].product_name;
        var department = res[i].department_name;
        var price = res[i].Price;
        var qty = res[i].stock_quantity;
        console.log(
            `Item #: ${id} || Product: ${name} || Department: ${department} ---------- ${price} (${qty} left)`
        );
    }
    console.log(`\n${divider}`);
}

function startMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: ["Shop all products", "Shop by department", "Exit"]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Shop all products":
                    shopProducts();
                    break;
                case "Shop by department":
                    shopByDepartment();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });
}

function shopProducts() {
    inquirer
        .prompt([{
                name: "id",
                type: "input",
                message: `What is the "Item #" of the product you would like to buy?`,
                validate: function (value) {
                    if (value !== "" && isNaN(value) === false) {
                        return true;
                    }
                    console.log(` Please enter a valid "Item #"`);
                    return false;
                }
            },
            {
                name: "qty",
                type: "input",
                message: "How many would you like to buy?",
                validate: function (value) {
                    if (value !== "" && isNaN(value) === false) {
                        return true;
                    }
                    console.log(" Please enter a valid quantity");
                    return false;
                }
            }
        ])
        .then(function (answer) {
            inventoryCheck(answer.id, answer.qty);
        });
}

function shopByDepartment() {
    inquirer
        .prompt({
            name: "department",
            type: "list",
            message: `Select a department.`,
            choices: ["Stickers", "Accessories", "Apparel"],
            validate: function (value) {
                if (value !== "") {
                    return true;
                }
                console.log(` Please select a valid department`);
                return false;
            }
        })
        .then(function (answer) {
            showProductsFromDept(answer.department);
        });
}

function showProductsFromDept(dept) {
    var query = `SELECT item_id, product_name, department_name, 
    CONCAT("$", price) AS Price, stock_quantity FROM products WHERE ?`;
    connection.query(query, {
        department_name: dept
    }, function (err, res) {
        if (err) throw err;
        displayProducts(res);
        shopProducts();
    });
}

function inventoryCheck(id, qty) {
    var query = "SELECT * FROM products WHERE ?";
    connection.query(
        query, {
            item_id: id
        },
        function (err, res) {
            if (err) throw err;
            if (res.stock_quantity < 1) {
                console.log("Insufficient quantity!");
            } else {
                updateQty(id, qty);
            }
        }
    );
}

function updateQty(id, qty) {
    var query = `UPDATE products SET stock_quantity=stock_quantity-${qty} WHERE ?`;
    connection.query(
        query, {
            item_id: id
        },
        function (err) {
            if (err) throw err;
            getTotal(id, qty);
        }
    );
}

function getTotal(id, qty) {
    var query = "SELECT * FROM products WHERE ?";
    connection.query(
        query, {
            item_id: id
        },
        function (err, res) {
            if (err) throw err;
            var total = parseFloat(res[0].price) * parseInt(qty);
            console.log(
                `\n${divider}\nCha ching!! Thanks for your order.\nYour total is: $${parseFloat(
          total
        )}\n${divider}`
            );
            startMenu();
        }
    );
}