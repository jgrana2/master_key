const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fs = require('fs');
const generator = require('generate-password');
const encryption = require('./encryption');
const pbkdf2 = require('pbkdf2');

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
      console.error('File does not exist. A new local.master_key file will be created.');
      decrypted_master_array = [];
    }
  }

  // Ask for new record name
  inquirer
    .prompt([
      {
        name: 'name',
        type: 'input',
        message: 'New Record Name:',
        validate: function (value) {
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
      if (decrypted_master_array.find(o => o.name === record_name) === undefined) {
        inquirer
          .prompt([
            {
              name: 'username',
              type: 'input',
              message: 'Enter Username:',
              validate: function (value) {
                if (value.length) {
                  return true;
                } else {
                  console.log('The username field is empty');
                  return true;
                }
              }
            },
            {
              name: 'password',
              type: 'password',
              message: 'Enter Password:',
              default: generator.generate({ length: 10, numbers: true }),
              validate: function (value) {
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
            clear();
            // Add new record to master array
            let final_record = { 'name': record_name, ...record };
            console.log('Record ' + JSON.stringify(final_record.name) + ' added succesfully');
            decrypted_master_array.push(final_record);

            // Encrypt
            let encrypted_master_array = encryption.encrypt(JSON.stringify(decrypted_master_array), key);

            // Write to file
            fs.writeFile('local.master_key', JSON.stringify(encrypted_master_array, null, "\t"), function (err) {
              if (err) throw err;
            });
          })
      } else {
        console.log("There's an existing record with that name, try another one.");
      }
    });
}