const jimp = require('jimp');
const axios = require('axios');
const fs = require('fs');

// Get Base64 Image
async function getBase64Image(img) {
    const image = await jimp.read(img);
    const base64 = await image.getBase64Async(jimp.MIME_PNG);
    return "data:image/png;base64," + base64;
}

// Process Image ( Remove Background )
async function processImage(img) {
    return new Promise(async (resolve, reject) => {
            await axios.post('https://bgremover.zyro.com/v1/ai/background-remover', {
                image_data: await getBase64Image(img).catch((error) => {
                    return reject(error.message);
                }),
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://zyro.com',
                    'Referer': 'https://zyro.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'
                }}).then(async (response) => {
                if (response.data.result) {
                   resolve(Buffer.from(response.data.result.split(',')[1], 'base64'));
                } else {
                    reject("Error");
                
                }
        }).catch((error) => {
            reject(error);
        })
    })
}

module.exports = {
    processImage: processImage
}