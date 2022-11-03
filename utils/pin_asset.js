const { unlinkSync } = require("fs");
require('dotenv').config();
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({pinataApiKey:process.env.PINATA_API_KEY, pinataSecretApiKey: process.env.PINATA_API_SECRET});
pinata.testAuthentication().then((result)=>console.log(result)).catch((err) =>console.log(err));

module.exports = {
    pinItem: async (pathh, options)=>{
        try {
            if( typeof(pathh) !== 'object' ){
                const pookie = await pinata.pinFromFS( pathh , options);
                unlinkSync( pathh );
                return pookie        
            }else{
                const pookie = await pinata.pinJSONToIPFS( pathh, options );
                return pookie;
            }
        } catch (error) {
            return {error,}
        }
    }
}