const {execSync} = require('child_process');


module.exports = async (command) => {
    try {
        await execSync(`${command}`, {stdio: 'inherit'})
    } catch (error) {
        console.log(error);
        return false; 
    }
    return true;
}