
const loadimg = async ( imgsrc, callback )=>{
    let img = document.createElement("img");
    img.addEventListener("load", ()=> callback(img) );
    
    img.src = imgsrc;
}

export { loadimg }