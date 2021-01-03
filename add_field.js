const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fs = require('fs');
const generator = require('generate-password');
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
        // Find the record to add the field to
        let record_to_add_field_to = decrypted_master_array.find(o => o.name === record.record_to_add);

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
                // Add field to record
                record_to_add_field_to[field.name] = field.content;

                // Update master array
                decrypted_master_array[field.name] = record_to_add_field_to;

                // Encrypt
                let encrypted_master_array = encryption.encrypt(JSON.stringify(decrypted_master_array));
                console.log('Encrypted array: ' + encrypted_master_array);

                // Write to file
                fs.writeFile('local_file.master', JSON.stringify(encrypted_master_array, null, "\t"), function (err) {
                  if (err) throw err;
                });
            })
            
    })
    .catch(e => console.log(e));
    