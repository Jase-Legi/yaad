import { imgSignature } from "./imgSignatures";

const validateIMGtype = async ( demFiles, childClassName, parentIdName, wrongFiles, callback) => {
    const parentEle = document.getElementById(parentIdName);
    parentEle.innerHTML = "";
    const demlen = demFiles.length;
    console.log(`files length: ${demlen}`);
    if ( demlen === 0 ){
        return callback([{id:null, value: null, msg:"Upload a file."}, wrongFiles]);
    }
    
    let loadedImgs = 0;

    const signatures = ['89504e47'.toLowerCase(), 'FFD8FFE0'.toLowerCase(), 'FFD8FFE1'.toLowerCase(), 'FFD8FFE2'.toLowerCase(), 'FFD8FFE8'.toLowerCase(), 'FFD8FFDB'.toLowerCase(), 'FFD8FFEE'.toLowerCase() ];

    for ( let n = 0; n < demlen ; n++ ) {
        let dafile = demFiles[n];
        // eslint-disable-next-line no-loop-func
        imgSignature(dafile, (fileSignature)=>{
            console.log(`file sig: ${fileSignature}`);
            // check if signature matches the signatures of jpgs and png file
            if( signatures.includes(fileSignature) ){
                const img = document.createElement("img");

                img.addEventListener( 'load', ()=>{
                    if( img.width <= 2000  && img.height <= 2000 ){
                        loadedImgs++;
                        const para = document.createElement("div");
                        para.appendChild(img);
                        para.classList.add((childClassName)?childClassName:'LayerUpldContentBox')
                        parentEle.appendChild(para);
                    }else{
                        img.remove();
                        wrongFiles.push(n);
                    }

                    if ( demlen === ( loadedImgs + wrongFiles.length ) ){
                        return callback([null, wrongFiles]);
                    }
                });
                
                img.src = URL.createObjectURL(dafile);
            }else{
                wrongFiles.push(n);
                if(demFiles.length === wrongFiles.length){
                    return callback([{id:null, value: null, msg:"Unsupported file types! JPG, JPEG, PNG only."}, wrongFiles]);
                }
            }
        });
    }
}

export { validateIMGtype }