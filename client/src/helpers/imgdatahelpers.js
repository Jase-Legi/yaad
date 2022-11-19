import { getFileExtension } from "./imgSignatures";

const validateIMGtype = async ( demFiles, childClassName, parentIdName, wrongFiles, callback) => {
    const parentEle = document.getElementById(parentIdName);
    parentEle.innerHTML = "";
    const demlen = demFiles.length;
    console.log(`files length: ${demlen}`);
    if ( demlen === 0 ){
        return callback([ "Upload a file.", wrongFiles]);
    }
    let imgArray = [];
    let loadedImgs = 0;
    for ( let n = 0; n < demlen ; n++ ) {
        let dafile = demFiles[n];
        // eslint-disable-next-line no-loop-func
        getFileExtension( dafile, ( [ path, ext ] )=>{
            if( ext ){
                if(ext.match(/^(jpg|png|gif|webp)/)){
                    const img = document.createElement("img");

                    img.addEventListener( 'load', ()=>{
                        if( img.width <= 2000  && img.height <= 2000 ){
                            loadedImgs++;
                            imgArray.push( { path, ext, } );
                            const para = document.createElement("div");
                            para.appendChild(img);
                            para.classList.add((childClassName)?childClassName:'LayerUpldContentBox')
                            parentEle.appendChild(para);
                        }else{
                            img.remove();
                            wrongFiles.push(n);
                        }

                        if ( demlen === ( loadedImgs + wrongFiles.length ) ){
                            return callback( [ null, wrongFiles, ( imgArray.length > 0 )?imgArray:null ] );
                        }
                    });
                    img.src = `data:image/${ext};base64,`+path;
                }else{
                    wrongFiles.push(n);
                    if(demFiles.length === wrongFiles.length){
                        return callback([ "Unsupported file types! JPG, JPEG, PNG, WEBP, GIF, JPE only.", wrongFiles ]);
                    }
                }
            }else{
                wrongFiles.push(n);
                if(demFiles.length === wrongFiles.length){
                    return callback([ "Unknown file type, images only! Supported types: JPG, JPEG, PNG only.", wrongFiles ]);
                }
            }
        });
    }
}

export { validateIMGtype }