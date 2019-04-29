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
    getName();
});

function getName() {
    inquirer
        .prompt({
            name: "name",
            type: "input",
            message: "Who are you?"
        })
        .then(function (answer) {
            console.log(`${divider}\nWelcome ${answer.name}.\n${divider}`);
            startMenu();
        });
}

function startMenu() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: ["View Product Sales by Department", "Create Department", "Exit"]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View Product Sales by Department":
                    viewProductSales();
                    break;
                case "Create Department":
                    createDepartment();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });
}

function viewProductSales() {
    var query = `
    SELECT departments.department_id, departments.department_name, SUM(products.product_sales) AS product_sales, departments.overhead_costs, (SUM(products.product_sales) - departments.overhead_costs) AS total_profit
    FROM departments
    LEFT JOIN products ON products.department_name = departments.department_name
    GROUP BY department_name
    ORDER BY departments.department_id
    `;
    connection.query(query, function (err, res) {
        if (err) throw err;
        displayProducts(res);
    });
}

function displayProducts(res) {
    console.log();
    var table = new Table({
        head: ['Department #', 'Name', 'Overhead Costs', 'Product Sales', 'Total Profit'],
        colWidths: [15, 15, 15, 15, 15]
    });
    for (var i = 0; i < res.length; i++) {
        var id = res[i].department_id;
        var name = res[i].department_name;
        var costs = res[i].overhead_costs;
        var sales = res[i].product_sales;
        var profit = res[i].total_profit;
        table.push([id, name, costs, sales, profit]);
    }
    console.log(table.toString());
    console.log(`\n${divider}`);
    setTimeout(startMenu, 500);
};

function createDepartment() {
    inquirer
        .prompt([{
                name: "name",
                type: "input",
                message: "What would you like to name the new department?",
                validate: function (value) {
                    if (value !== "") {
                        return true;
                    }
                    console.log(` Please enter a valid name (no #'s or special characters)`);
                    return false;
                }
            },
            {
                name: "cost",
                type: "input",
                message: "What is the overhead cost?",
                validate: function (value) {
                    if (value !== "" && isNaN(value) === false) {
                        return true;
                    }
                    console.log(` Please enter a valid number`);
                    return false;
                }
            }
        ])
        .then(function (answer) {
            var query = `INSERT INTO departments (department_name, overhead_costs) VALUES("${answer.name}", ${answer.cost})`;
            connection.query(query, function (err, res) {
                if (err) throw err;
                console.log(`${answer.name} department successfully added!`);
            })
            startMenu();
        })
};