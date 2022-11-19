
const getFileExtension = ( BLOBfile, callback )=>{
    const readr = new FileReader();
    let fileLoaded = 0;

    readr.addEventListener( "load", ()=>{
        fileLoaded++;
        const dataURLpath = readr.result.split(','), fullePre64String = dataURLpath[0];
        let pre64String = dataURLpath[0].split(';')[0];
        const dataURLtype = pre64String.split('/')[0];
        // console.log(`pre64String:: ${ pre64String }`);

        imgSignature( dataURLpath, ( signature )=>{
            console.log(`BLOBfile signature: ${ fullePre64String }`);
            let ext = null;
            switch ( signature ) {
                case 'ffd8ffe0':
                case 'ffd8ffe1':
                case 'ffd8ffe2':
                case 'ffd8ffe8':
                case 'ffd8ffdb':
                case 'ffd8ffeE':
                    ext = 'jpg';
                    break;
                case '25504446':
                    switch ( pre64String ) {
                        case 'data:application/postscript':
                            ext = 'ai';
                            break;
                        case 'data:application/pdf':
                            ext = 'pdf';
                            break;
                        default:
                            ext = null;
                            break;
                    }
                    break;
                case '52494658':
                    ext = 'aep';
                    break;
                case '38425053':
                    ext = 'psd';
                    break;
                case '25215053':
                case 'c5d0d3c6':
                    ext = 'eps';
                    break;
                case '5bda20':
                case '20203134':
                case '5b536174':
                case '5bda7b':
                case '41646f62':
                case '51756f64':
                    ext = 'txt';
                    break;
                case '23696e63':
                case '2f2f2073':
                case '23707261':
                case '2f2f204d':
                    ext = 'cpp';
                    break;
                case '23212f75':
                    ext = 'py';
                    break;
                case '20202020':
                case 'efbbbf2f':
                case '76617220':
                case '21206675':
                case '2f2a21a':
                case '2f2aa20':
                case '2f2a2a20':
                    ext = 'js';
                    break;
                case '7b226964':
                case '7b227765':
                case '7ba2020':
                case '7b227265':
                case '7bda20':
                    ext = 'json';
                    break;
                case 'a3c212d':
                case '3c21444f':
                    ext = 'html';
                    break;
                case 'da2377':
                case 'da626f':
                case 'da2e63':
                    ext = 'css';
                    break;
                case '2f2f2053':
                    ext = 'sol';
                    break;
                case 'd0cf11e0':
                case '3b202020':
                    switch ( pre64String ) {
                        case 'data:application/vnd.ms-powerpoint':
                            ext = 'ppt';
                            break;
                        case 'data:application/msword':
                            ext = 'doc';
                            break;
                        case 'data:application/vnd.ms-excel':
                            ext = 'xls';
                            break;
                        default:
                            ext = null;
                            break;
                    }
                    break;
                case '7b5c7274':
                    ext = 'rtf';
                    break;
                case '504b34':
                    switch ( pre64String ) {
                        case 'data:application/x-zip-compressed':
                            ext = 'zip';
                            break;
                        case 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                            ext = 'docx';
                            break;
                        case 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                            ext = 'xlsx'
                            break;
                        case 'data:application/vnd.openxmlformats-officedocument.presentationml.presentation':
                            ext = 'pptx';
                            break;
                        default:
                            ext = null;
                            break;
                    }
                    break;
                case '52617221':
                    ext = 'rar';
                    break;
                case '89504e47':
                    ext = 'png';
                    break;
                case '0010':
                    ext = 'ico';
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
                case '001b3':
                    ext = 'mpg';
                    break;
                case '001ba':
                    ext = 'mpeg';
                    break;
                case '435753a':
                    ext = 'swf';
                    break;
                case '4944334':
                case '4944333':
                    ext = 'mp3';
                    break;
                case '4f676753':
                    switch ( dataURLtype ) {
                        case 'data:video':
                            ext = 'ogv'
                            break;
                        case 'data:audio':
                            ext = 'ogg';
                            break;
                        default:
                            ext = null;
                            break;
                    }
                    break;
                case '53796d62':
                case '7469636b':
                case '2c466972':
                case '2247616d':
                    ext = 'csv';
                    break;
                case '3c3f786d':
                    switch ( dataURLtype ) {
                        case 'data:text':
                            ext = 'xml';
                            break;
                        case 'data:image':
                            ext = 'svg';
                            break;
                        default:
                            ext = null;
                            break;
                    }
                    break;
                case '47494638':
                    ext = 'gif';
                    break;
                case '52494646':
                    switch ( dataURLtype ) {
                        case 'data:image':
                            ext = 'webp';
                            break;
                        case 'data:video':
                            ext = 'avi';
                            break;
                        case 'data:audio':
                            ext = 'wav';
                            break;
                        default:
                            ext = null;
                            break;
                    }
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
                case '424d8a7b':
                    ext = 'bmp';
                    break;
                case '3c3f7068':
                    ext = 'php'
                    break;
                default:
                    break;
            }

            if ( fileLoaded === 1 ){
                console.log(`BLOBfile ext: ${ext}`);
                return callback( [ dataURLpath[1], ext ] );
            }
        });
    });

    readr.readAsDataURL( BLOBfile );
    // const urlpath = URL.createObjectURL
    // console.log(`url path:${urlpath}`)
}

const imgSignature = ( urlparts, callback )=>{
    // const urlparts = dataURL.split(',');
    let mime = urlparts[0], binaryString = atob(urlparts[1]), u8arrayLength = binaryString.length, u8rray = new Uint8Array(u8arrayLength);
    while (u8arrayLength--) {
        u8rray[ u8arrayLength ] = binaryString.charCodeAt( u8arrayLength );
    }
    const sigArray = u8rray.subarray( 0, 4 );
    let fileSignature = "";
    for( let m = 0; m < sigArray.length; m++ ){ fileSignature += sigArray[m].toString(16); }
    return callback( fileSignature );
};

// const imgSignature = async ( BLOBfile, callback )=>{
//     let readr = new FileReader();
//     // Read BLOBfile as array buffer
//     readr.readAsArrayBuffer(BLOBfile);

//     // after buffer loads
//     readr.addEventListener( 'loadend', ()=>{
//         // convert BLOBfile buffer array to  bit array and splice the first 4 elements of this array
//         let buffArray = ( new Uint8Array( readr.result )).subarray( 0, 4 ),
//         fileSignature = "";
//         // convert first 4 elements to hexadecimal string and contact them together to create BLOBfile signature
//         for( let m = 0; m < buffArray.length; m++ ){ fileSignature += buffArray[m].toString(16); }
//         return callback(fileSignature);
//     })
// }

export { imgSignature, getFileExtension }