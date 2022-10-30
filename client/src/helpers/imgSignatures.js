const imgSignature = async ( file, callback )=>{
    // initialize FileReader class
    let readr = new FileReader();
    // Read file as array buffer
    readr.readAsArrayBuffer(file);

    // after buffer loads
    readr.onloadend = ()=>{
        // convert file buffer array to  bit array and splice the first 4 elements of this array
        let buffArray = ( new Uint8Array( readr.result )).subarray(0, 4),
        fileSignature = "";
        
        // convert first 4 elements to hexadecimal string and contact them together to create file signature
        for( let m = 0; m < buffArray.length; m++ ){ fileSignature += buffArray[m].toString(16); }
        return callback(fileSignature);
    }
};

export { imgSignature }