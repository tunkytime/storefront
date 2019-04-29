var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
var divider = "===========================================================";
var connection = mysql.createConnection({
    host: "localHost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(
        `${divider}\nWelcome to Bamazon!\n${divider}`
    );
    departmentsList();
    startMenu();
});

var departments = [];

function departmentsList() {
    var query = "SELECT * FROM departments";
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            departments.push(res[i].department_name);
        }
    })
};

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
                    readProducts();
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

function readProducts() {
    var query = `SELECT item_id, product_name, department_name, 
    CONCAT("$", price) AS Price, stock_quantity FROM products`;
    connection.query(query, function (err, res) {
        if (err) throw err;
        displayProducts(res);
    });
}

function displayProducts(res) {
    console.log();
    var max = 0;
    var table = new Table({
        head: ['Item #', 'Product', 'Department', 'Price', 'Qty'],
        colWidths: [8, 15, 15, 10, 5]
    });
    for (var i = 0; i < res.length; i++) {
        var id = res[i].item_id;
        var name = res[i].product_name;
        var department = res[i].department_name;
        var price = res[i].Price;
        var qty = res[i].stock_quantity;
        table.push([id, name, department, price, qty]);
        max = Math.max([res[i].item_id])
    }
    console.log(table.toString());
    console.log(`\n${divider}`);
    shopProducts(max);
}

function shopProducts(max) {
    inquirer
        .prompt([{
                name: "id",
                type: "input",
                message: `What is the "Item #" of the product you would like to buy?`,
                validate: function (value) {
                    if (value !== "" && isNaN(value) === false && value <= max) {
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
            inventoryCheck(answer.id, answer.qty, max);
        });
}

function shopByDepartment() {
    inquirer
        .prompt({
            name: "department",
            type: "list",
            message: `Select a department.`,
            choices: departments,
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
    });
}

function inventoryCheck(id, qty, max) {
    var qtyDB;
    var query = "SELECT * FROM products WHERE ?";
    connection.query(
        query, {
            item_id: id
        },
        function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++) {
                qtyDB = res[i].stock_quantity;
            }
            if (qtyDB < 1 || qtyDB < qty) {
                console.log(divider);
                console.log("Insufficient quantity!");
                console.log(divider);
                shopProducts(max);
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
                `\n${divider}\nWahoo!! Thanks for your order.\nYour total is: $${parseFloat(total)}\n${divider}`
            );
            updateProductSales(id, total);
            startMenu();
        }
    );
}

function updateProductSales(id, total) {
    var query = `UPDATE products SET product_sales = (product_sales + ${total}) WHERE ?`;
    connection.query(query, {
            item_id: id
        }),
        function (err) {
            if (err) throw err;
        }
};