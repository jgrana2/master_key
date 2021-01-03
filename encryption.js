'use strict';

const crypto = require('crypto');
var pbkdf2 = require('pbkdf2')

const ENCRYPTION_KEY = pbkdf2.pbkdf2Sync(process.env.MASTER_PASSWORD, 'salt', 1, 32, 'sha512');

const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
 console.log('Encryption key: ' + ENCRYPTION_KEY.toString('hex'));
 let iv = crypto.randomBytes(IV_LENGTH);
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let encrypted = cipher.update(text);

 encrypted = Buffer.concat([encrypted, cipher.final()]);

 return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
 let textParts = text.split(':');
 let iv = Buffer.from(textParts.shift(), 'hex');
 let encryptedText = Buffer.from(textParts.join(':'), 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let decrypted = decipher.update(encryptedText);

 decrypted = Buffer.concat([decrypted, decipher.final()]);

 return decrypted.toString();
}

module.exports = { decrypt, encrypt };