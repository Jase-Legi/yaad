const isAplhaNumeric = (str)=>{
    for (let ind = 0; ind < str.length; ind++) {
        let  get_code = str.charCodeAt(ind);

        if (!(get_code > 47 && get_code < 58) && /* numeric (0-9) */ !(get_code > 64 && get_code < 91) && /* upper alpha (A-Z)*/ !(get_code > 96 && get_code < 123) && !(get_code === 95)) /* lower alpha (a-z)*/ 
        {
            return false;
        }
    }
    return true;
};

export { isAplhaNumeric }