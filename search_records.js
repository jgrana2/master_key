const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fs = require('fs');
const generator = require('generate-password');
const ncp = require('copy-paste');
const encryption = require('./encryption');

// Register plugin
inquirer.registerPrompt("search-list", require('inquirer-search-list'));

clear();

console.log(
  chalk.yellow(
    figlet.textSync('Master Key', { horizontalLayout: 'full' })
  )
);


// Load master file
let master_raw = fs.readFileSync('local_file.master');
let master_array = JSON.parse(master_raw);
let decrypted_master_array = JSON.parse(encryption.decrypt(master_array));
console.log('Decrypted: ' + JSON.stringify(decrypted_master_array));

inquirer
    .prompt([
        {
            type: "search-list",
            message: "Select record to add",
            name: "record_to_add",
            choices: decrypted_master_array,
        }
    ])
    .then(function(record) {
        let found_record = decrypted_master_array.find(o => o.name === record.record_to_add);

        inquirer
        .prompt([
            {
                type: "list",
                message: "Select the field to copy to clipboard",
                name: "name",
                choices: Object.keys(found_record),
            }
        ])
        .then(function(selected_field) {
            ncp.copy(found_record[selected_field.name], function () {
              console.log('Contents of field "' + selected_field.name + '" copied to clipboard');
            });
            
            
        })
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));