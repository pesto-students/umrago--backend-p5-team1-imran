const fs = require('fs');
module.exports = (airlines_logo) => {
    const imagePathArray = airlines_logo.split('/');
    const imagePath = imagePathArray[imagePathArray.length-1];
    const dirPath = __dirname + '/../' + 'images/'+imagePath;
    fs.unlink( dirPath , error => {
        if(error) {console.log(error)}
    })
};