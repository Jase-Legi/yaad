
const shuffle = (arra1)=> {
    var ctr = arra1.length, temp, index;
    // While there are elements in the array
    while (ctr > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * ctr);
        // Decrease ctr by 1
        ctr--;
        // And swap the last element with it
        temp = arra1[ctr];
        arra1[ctr] = arra1[index];
        arra1[index] = temp;
    }
    return arra1;
}

const get_all_possible_array_combos =  async ( input, output, n, da_path )=>{
    da_path = (da_path === null || da_path === undefined)? []: da_path;
    n = (n === null || n === undefined)? 0:n;
    if(n < input.length){
        const current_item = input[n]; let gogo = 0;
        while(gogo < current_item.length){
            let val = current_item[gogo];
            da_path.push(val);
            get_all_possible_array_combos(input, output, n+1, da_path);
            da_path.pop();
            gogo++;
        }
    }else{
        output.push(da_path.slice());
    }
};

export { shuffle, get_all_possible_array_combos };