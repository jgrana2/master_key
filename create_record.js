const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fs = require('fs');
const generator = require('generate-password');
const encryption = require('./encryption');

clear();

console.log(
  chalk.yellow(
    figlet.textSync('Master Key', { horizontalLayout: 'full' })
  )
);

// Load master file
var decrypted_master_array = [];
const file = 'local_file.master';

// Test the if the file exists 
console.log('\n> Checking if the file exists...'); 
try { 
  fs.accessSync(file, fs.constants.F_OK); 
  console.log('File does exist'); 
  let master_array = JSON.parse(fs.readFileSync('local_file.master'));
    decrypted_master_array = JSON.parse(encryption.decrypt(master_array));
    console.log('Decrypted: ' + JSON.stringify(decrypted_master_array));
} catch (err) { 
  console.error('File does not exist'); 
  decrypted_master_array = [];
} 

// Ask for new record name
inquirer
  .prompt([
      {
        name: 'name',
        type: 'input',
        message: 'New Record Name:',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter the new record name';
          }
        }
      }])
      .then((record) => {
          // 
          let record_name = record.name;
          
          // Search for existing records with the same name
          if (decrypted_master_array.find(o => o.name === record_name) === undefined){
              inquirer
                .prompt([
                          {
                            name: 'username',
                            type: 'input',
                            message: 'Enter Username:',
                            validate: function(value) {
                            if (value.length) {
                                return true;
                            }else{
                                console.log('The username field is empty');
                                return true;
                            }
                            }
                        },
                        {
                            name: 'password',
                            type: 'input',
                            message: 'Enter Password:',
                            default: generator.generate({length: 10, numbers: true}),
                            validate: function(value) {
                            if (value.length) {
                                return true;
                            } else {
                                console.log('The password is empty');
                                return true;
                            }
                            }
                        }
                ])
                .then((record) => {
                    // Add new record to master array
                    let final_record = {'name': record_name, ...record};
                    console.log('Add record: ' + JSON.stringify(final_record));
                    decrypted_master_array.push(final_record);

                    // Encrypt
                    let encrypted_master_array = encryption.encrypt(JSON.stringify(decrypted_master_array));
                    console.log('Encrypted array: ' + encrypted_master_array);

                    // Write to file
                    fs.writeFile('local_file.master', JSON.stringify(encrypted_master_array, null, "\t"), function (err) {
                      if (err) throw err;
                    });
                })
          } else {
              console.log('There is an existing record with that name, try another one');
          }
      });