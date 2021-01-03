const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fs = require('fs');
const generator = require('generate-password');

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
          if (master_array.find(o => o.name === record_name) === undefined){
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
                    // Write to master 
                    record['name'] = record_name;
                    master_array.push(record);
                    fs.writeFile('local_file.master', JSON.stringify(master_array, null, "\t"), function (err) {
                        if (err) throw err;
                    });
                })
          } else {
              console.log('There is an existing record with that name, try another one');
          }
      });