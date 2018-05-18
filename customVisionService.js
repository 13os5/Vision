'use strict';

const request = require('request-promise').defaults({ encoding: null });

module.exports = {
    predict: predict
}

function predict(stream) {
    const options = {
        method: 'POST',
        url: 'https://southcentralus.api.cognitive.microsoft.com/customvision/v2.0/Prediction/d35248c2-8d5b-4e27-996e-5b148c81a219/image?iterationId=c8aa764f-4973-474b-b15d-3bc3ba3bd91e',        
        headers: {
            'Content-Type': 'application/octet-stream',
            'Prediction-Key': 'c8ec128cfbcc434883f005a1fc23bbff'
        },        
        body: stream
    };

    return request(options);
}