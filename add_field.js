const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fs = require('fs');
const generator = require('generate-password');
const encryption = require('./encryption');
const pbkdf2 = require('pbkdf2');

// Register plugin
inquirer.registerPrompt("search-list", require('inquirer-search-list'));

clear();

console.log(
    chalk.yellow(
        figlet.textSync('Master Key', { horizontalLayout: 'full' })
    )
);

inquirer
    .prompt([
        {
            name: 'password',
            type: 'password',
            message: 'Please enter Master Password:'
        }
    ])
    .then((master) => {
        const key = pbkdf2.pbkdf2Sync(master.password, 'salt', 1, 32, 'sha512');
        start(key);
    });

function start(key) {

    var decrypted_master_array = [];
    const file = 'local.master_key';

    // Check if the master file exists
    try {
        fs.accessSync(file, fs.constants.F_OK);
        let master_array = JSON.parse(fs.readFileSync('local.master_key'));
        decrypted_master_array = JSON.parse(encryption.decrypt(master_array, key));
        console.log('Master file decrypted');
    } catch (err) {
        // Catch wrong password
        if (err.message === 'error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt') {
            console.log('Wrong password');
            return false;
        } else {
            // Catch file doesn't exists
            console.error('File does not exist. Run node create_record.js to create a new master file.');
            return false;
        }
    }

    inquirer
        .prompt([
            {
                type: "search-list",
                message: "Select record to add",
                name: "record_to_add",
                choices: decrypted_master_array,
            }
        ])
        .then(function (record) {
            // Find the record to add the field to
            let record_to_add_field_to = decrypted_master_array.find(o => o.name === record.record_to_add);

            // Ask for new field
            inquirer
                .prompt([
                    {
                        name: 'name',
                        type: 'input',
                        message: 'New Field Name:',
                        validate: function (value) {
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
                        default: generator.generate({ length: 10, numbers: true }),
                        validate: function (value) {
                            if (value.length) {
                                return true;
                            } else {
                                return 'Please enter the new field content';
                            }
                        }
                    }
                ])
                .then(function (field) {
                    clear();
                    // Add field to record
                    record_to_add_field_to[field.name] = field.content;

                    // Update master array
                    decrypted_master_array[field.name] = record_to_add_field_to;

                    console.log('Field ' + JSON.stringify(field.name) + ' added succesfully');

                    // Encrypt
                    let encrypted_master_array = encryption.encrypt(JSON.stringify(decrypted_master_array), key);

                    // Write to file
                    fs.writeFile('local.master_key', JSON.stringify(encrypted_master_array, null, "\t"), function (err) {
                        if (err) throw err;
                    });
                })

        })
        .catch(e => console.log(e));
}