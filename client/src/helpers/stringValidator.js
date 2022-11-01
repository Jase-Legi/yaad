const isAplhaNumeric = (str, extraCharacters )=>{
    const trimmedString = ( !str )?false:str.trim();
    const trimmedStringLength = trimmedString.length;

    for ( let ind = 0; ind < trimmedStringLength; ind++) {
        let  get_code = str.charCodeAt(ind);
        //  /* numeric (0-9) = 48-57 */  /* upper alpha (A-Z) = 65-90*/ /* lower alpha (a-z) = 97-122*/  /*_ = 95*/
        if ( !( get_code > 47 && get_code < 58 ) && !( get_code > 64 && get_code < 91 ) && !( get_code > 96 && get_code < 123  ) ) {
            if ( extraCharacters ) {
                if ( extraCharacters.includes( str[ind] ) ){
                    continue;
                }
            }

            return false;
        }
    }
    
    return true;
};

const isNumeric = ( str )=>{
    const trimmedString = ( !str )?false:str.trim();
    const trimmedStringLength = trimmedString.length;
    let dotOccurrences = 0;

    for ( let ind = 0; ind < trimmedStringLength; ind++) {
        let  get_code = str.charCodeAt(ind);
        //  /* numeric (0-9) = 48-57 */
        if ( !( get_code > 47 && get_code < 58 ) ) {
            if ( '.' === str[ind] ) {
                if ( dotOccurrences === 1 ){
                    return false;
                }
                dotOccurrences++;
                continue;
            }
            return false;
        }
    }
    
    return true;
};

const stringLengthRange = ( str, min, max)=>{
    const trimmedString = ( !str )?false:str.trim();
    const trimmedStringLength = trimmedString.length;
    if( !max && ( trimmedStringLength >= min )){
        return true;
    }

    if( ( trimmedStringLength >= min ) && ( trimmedStringLength <= max ) ){
        return true;
    }

    return false;
}

export { isAplhaNumeric, stringLengthRange, isNumeric }