const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fs = require('fs');
const generator = require('generate-password');

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
 
inquirer
    .prompt([
        {
            type: "search-list",
            message: "Select record to add",
            name: "record_to_add",
            choices: master_array,
        }
    ])
    .then(function(record) {
        // Find the record to add the field to
        let record_to_add = master_array.find(o => o.name === record.record_to_add);

        // Ask for new field
        inquirer
            .prompt([
                {
                    name: 'name',
                    type: 'input',
                    message: 'New Field Name:',
                    validate: function( value ) {
                        if (value.length) {
                            return true;
                        } else {
                            return 'Please enter the new field name';
                        }
                    }
                },
                {
                    name: 'content',
                    type: 'input',
                    message: 'New Field Content:',
                    default: generator.generate({length: 10, numbers: true}),
                    validate: function( value ) {
                        if (value.length) {
                            return true;
                        } else {
                            return 'Please enter the new field content';
                        }
                    }
                }
            ])
            .then(function (field) {
                // Update master array
                record_to_add[field.name] = field.content;
                master_array[field.name] = record_to_add;

                // Write to master file
                fs.writeFile('local_file.master', JSON.stringify(master_array, null, "\t"), function (err) {
                if (err) throw err;
                });

                console.log('New field "' + field.name + '" added to record "' + record_to_add.name + '" with content "' + field.content + '"');
            })
            
    })
    .catch(e => console.log(e));
    