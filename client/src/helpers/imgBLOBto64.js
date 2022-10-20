// This function takes an image and converts it to a base 64 encoding and removes the image data before the base64 string
const imgToBase64String = async ( img, dataURL )=>{
    if( img !== null ){
        let canvas =  document.createElement("canvas");
        canvas.height = img.height;
        canvas.width = img.width;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");
        // console.log(`data url = ${dataURL}`);
        return dataURL;
    }
    const ddataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    return ddataURL;
};

const imgURLFromBase64String = (dataURL)=>{
    // let prestring = ('/' === dataURL[0])?"data:image/png;base64,":"data:image/png;base64,";
    let prestring;
    switch (dataURL[0]) {
        case '/':
            prestring = "data:image/jpg;base64,";
            break;
        case 'i':
            prestring = "data:image/png;base64,";
            break;
        default:
            prestring = "data:image/png;base64,";
            break;
    }
    return prestring+dataURL;
};

export { imgToBase64String, imgURLFromBase64String }