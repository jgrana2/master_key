const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fs = require('fs');
const clipboardy = require('clipboardy');
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
            console.log(err.message);
            // Catch file doesn't exists
            console.error('File does not exist, run node create_record.js to create a new master file.');
            return false;
        }
    }

    inquirer
        .prompt([
            {
                type: "search-list",
                message: "Select record to show",
                name: "record_to_add",
                choices: decrypted_master_array,
            }
        ])
        .then(function (record) {
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
                .then(function (selected_field) {
                    clipboardy.writeSync(found_record[selected_field.name]);
                    console.log('Contents of field "' + selected_field.name + '" copied to clipboard');
                })
                .catch(e => console.log(e));
        })
        .catch(e => console.log(e));
}