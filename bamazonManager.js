var mysql = require("mysql");
var inquirer = require("inquirer");
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
    getName();
});

function getName() {
    inquirer
        .prompt({
            name: "name",
            type: "input",
            message: "Who are you?",
        })
        .then(function (answer) {
            console.log(`${divider}\nWelcome ${answer.name}.\n${divider}`);
            startMenu();
        });
};

function startMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: ["View Products", "View Low Inventory", "Add Inventory", "Add New Product", "Exit"]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View Products":
                    viewProducts();
                    break;
                case "View Low Inventory":
                    viewInventory();
                    break;
                case "Add Inventory":
                    viewProducts();
                    setTimeout(addInventory, 1000);
                    break;
                case "Add New Product":
                    // addProduct();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });
}

function viewProducts() {
    var query = `SELECT item_id, product_name, department_name, stock_quantity FROM products`;
    connection.query(query, function (err, res) {
        if (err) throw err;
        displayProducts(res);
    });
};

function displayProducts(res) {
    console.log();
    for (var i = 0; i < res.length; i++) {
        var id = res[i].item_id;
        var name = res[i].product_name;
        var category = res[i].department_name;
        var qty = res[i].stock_quantity;
        console.log(
            `Item #: ${id} || Product: ${name} || Category: ${category} || Quantity: ${qty}`
        );
    }
    console.log(`\n${divider}`);
};

function viewInventory() {
    var query = "SELECT item_id, product_name, department_name, stock_quantity FROM products WHERE stock_quantity<10";
    connection.query(query, function (err, res) {
        if (err) throw err;
        if (res.length === 0) {
            console.log(`\n${divider}\nAll stocked up!\n${divider}\n`);
            startMenu();
        } else {
            displayProducts(res);
            // addInventory();
        }
    })
};

function addInventory() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: `Enter an "Item #" to add inventory:`,
        validate: function (value) {
            if (value !== "" && isNaN(value) === false) {
                return true;
            }
            console.log(` Please enter a valid "Item #"`);
            return false;
        }
    }, {
        name: "qty",
        type: "input",
        message: "How many would you like to add?",
        validate: function (value) {
            if (value !== "" && isNaN(value) === false) {
                return true;
            }
            console.log(" Please enter a valid quantity");
            return false;
        }
    }]).then(function (answer) {
        addInventoryDB(answer.id, answer.qty);
    })
};

function addInventoryDB(id, qty) {
    var query = `UPDATE products SET stock_quantity=stock_quantity+${qty} WHERE item_id=${id}`;
    connection.query(query, function (err) {
        if (err) throw err;
        console.log(`\n${divider}\nSuccess!\n${divider}\n`);
        startMenu();
    })
};