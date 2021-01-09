# master_key

![alt text](https://github.com/jgrana2/master_key/blob/master/screenshot.png?raw=true)

This master key script is a Node.js app to store encrypted passwords on a local master file securely. This app is designed to be run locally, with no cloud server yet. However, since the master file is encrypted, you can safely store it in any cloud service or push it to a private GitHub repo to keep track of changes.

## USAGE

```console
git clone https://github.com/ElPopularVale/master_key.git
npm install
```

To create a new record (the program will create a new master file is none exists)

```console
node create_record.js
```

To search created records:

```console
node search_records.js
```

To add a new field to an existing record:

```console
node add_field.js
```
