
const getFileExtension = ( signature, type )=>{
    let ext = null;
    switch ( signature ) {
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe8':
        case 'ffd8ffdb':
        case 'ffd8ffeE':
            ext = 'png';
            break;
        case '25504446':
            ext = 'pdf';
            break;
        case '20203036':
            ext ='png';
            break;
        case '89504e47':
            ext = 'png';
            break;
        case '00014':
        case '033db':
            ext = 'mov';
            break;
        case '00018':
        case '00020':
        case '0001c':
            ext = 'mp4';
            break;
        case '4944334':
        case '4944333':
            ext = 'mp3';
            break;
        case '4f676753':
            ext = 'ogg';
            break;
        case '53796d62':
            ext = 'csv';
            break;
        case '3c3f786d':
            ext = 'svg';
            break;
        case '47494638':
            ext = 'gif';
            break;
        case '52494646':
            ext = 'webp';
            break;
        case '1a45dfa3':
            ext = 'webm';
            break;
        case '3026b275':
            ext = 'wmv';
            break;
        case '464c561':
            ext = 'flv';
            break;
        case '49492a0':
            ext = 'tiff';
            break;
        case '424df6d4':
            ext = 'bmp';
            break;
        default:
            break;
    }
    return ext;
}

const imgSignature = async ( file, callback )=>{
    let readr = new FileReader();
    // Read file as array buffer
    readr.readAsArrayBuffer(file);

    // after buffer loads
    readr.addEventListener( 'loadend', ()=>{
        // convert file buffer array to  bit array and splice the first 4 elements of this array
        let buffArray = ( new Uint8Array( readr.result )).subarray( 0, 4 ),
        fileSignature = "";
        // console.log(`buff: ${buffArray}`)
        // convert first 4 elements to hexadecimal string and contact them together to create file signature
        for( let m = 0; m < buffArray.length; m++ ){ fileSignature += buffArray[m].toString(16); }
        return callback(fileSignature);
    })
}

export { imgSignature, getFileExtension }