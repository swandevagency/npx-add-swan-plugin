#!/usr/bin/env node

const packageName = process.argv[2];
const path = require('path');
const fs = require('fs');
const runCommand = require("swan-run-command");

// list of directories we want to copy to

const swanMiddlewaresDirectory = path.join(`${process.cwd()}/src/middlewares`, 'swan_middlewares');
const pagesDirectory = path.join(`${process.cwd()}/src/database`, 'pages');
const modelsDirectory = path.join(`${process.cwd()}/src/database`, 'models');
const apiDirectory = path.join(`${process.cwd()}/src`, 'api');

// list of directories we want to copy from

const packageDirectory = `${process.cwd()}/node_modules/${packageName}`

const middlewares = `${packageDirectory}/swan_middlewares`;
const pages = `${packageDirectory}/pages`;
const models = `${packageDirectory}/models`;
const api = `${packageDirectory}/api`;
const swanConfig = `${packageDirectory}/swan-config.js`;

// making sure that the package is already installed otherwise install it !

const installPackage = () => new Promise((resolve, reject) => {
    if (fs.existsSync(packageDirectory)) {
        resolve()
    }else{
        runCommand(`npm install ${packageName}`);
        reject(`"run npx add-swan-plugin  ${packageName}" once more to add the swan-plugin`)
    }
})

// making sure this command is used for a swan-plugin

if(!middlewares || !pages || !models || !api || !swanConfig){
    console.log(`package ${packageName} is not a swan-plugin !`);
    process.exit(-1);
}

// creating copy function factory

class copyFunction {
    constructor(directoryToCopyFrom, directoryToCopyTo, allowedFormat, hard) {
        this.directoryToCopyFrom = directoryToCopyFrom;
        this.directoryToCopyTo = directoryToCopyTo;
        this.allowedFormat = allowedFormat;
        this.hard = hard
    }
    exec() {

        const {directoryToCopyFrom, directoryToCopyTo, allowedFormat, hard} = this

        return new Promise((resolve, reject) =>

            fs.readdir(directoryToCopyFrom, (err, files) => {

                if (err) reject(err);

                files.forEach((file) => {

                    if (file.split('.')[1] === allowedFormat) {

                        if (!fs.existsSync(`${directoryToCopyTo}/${file}`) || hard) {

                            fs.copyFile(`${directoryToCopyFrom}/${file}`, `${directoryToCopyTo}/${file}`, (err) => {
                                if (err) reject(err);
                            });

                        }else{
                            reject(`${file} already exists in ${directoryToCopyTo} to replace the function use npx add-swan-plugin  ${packageName} hard`)
                        }

                    }

                });
                
                resolve();
            })

        );
    }
}

//functions to copy the files

const copyApis = () => new Promise((resolve, reject) => {

    fs.readdir(api, (err, files) => {

        if (err) reject(err);

        files.forEach(async(directory) => {

            if (!directory.split('.')[1]) {

                if (!fs.existsSync(`${apiDirectory}/${directory}`) || process.argv[3]) {
                    
                    if (!fs.existsSync(`${apiDirectory}/${directory}`) ) {
                        
                        fs.mkdir(`${apiDirectory}/${directory}`, (err) => {

                            if (err) reject(err);
    
                            fs.mkdir(`${apiDirectory}/${directory}/controllers`, (err) =>{

                                if(err) reject(err);
    
                                fs.copyFile(`${api}/${directory}/routes.json`, `${apiDirectory}/${directory}/routes.json`, (err) => {
    
                                    if (err) reject(err);
    
                                    fs.copyFile(`${api}/${directory}/plugin.json`, `${apiDirectory}/${directory}/plugin.json`, (err) => {
                                        if (err) reject(err);
                                        
                                    })
                                    
                                });
                            })
                            
                        });

                        resolve();

                    }else{

                        if (!fs.existsSync(`${apiDirectory}/${directory}/controllers`)) {
                            fs.mkdir(`${apiDirectory}/${directory}/controllers`, (err) =>{
                                if(err) reject(err);
                            })
                        }

                        fs.copyFile(`${api}/${directory}/routes.json`, `${apiDirectory}/${directory}/routes.json`, (err) => {
    
                            if (err) reject(err);

                            fs.copyFile(`${api}/${directory}/plugin.json`, `${apiDirectory}/${directory}/plugin.json`, (err) => {
                                if (err) reject(err);
                                
                            })
                            
                        });

                        resolve();

                    }

                }else{
                    reject(`${directory} directory already exists in api directory. to replace the function use npx add-swan-plugin ${packageName} hard`)
                }

            }

        });
        
        resolve();
    })

})


const copyMiddlewares = new copyFunction(middlewares, swanMiddlewaresDirectory, "js", process.argv[3]);
const copyPages = new copyFunction(pages, pagesDirectory, "json", process.argv[3]);
const copyModels = new copyFunction(models, modelsDirectory, "json", process.argv[3]);

const ecexFuntion = async() => {
    try {
        await installPackage();
        await copyMiddlewares.exec();
        await copyPages.exec();
        await copyModels.exec();
        await copyApis();

    } catch (error) {
        console.log(error);
    }
}
ecexFuntion();