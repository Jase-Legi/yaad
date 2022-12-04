const expandABox  = ( e, expandee, expandedClass, contractedClass )=>{
    // element that calls the click event should be a button or element containing inner text
    let ele = (e)?e.target:null;

    // Check if div to be expanded is already expanded via a css class
    // If it is expanded then swap class for a contracted css class ( which in this case is overflowY set to 'hidden' )
    if ( expandee.classList.contains( expandedClass ) ) {
        expandee.classList.remove( expandedClass );
        expandee.classList.add( contractedClass ); // 'contract-container');
        if( ele )
            ele.innerText = "expand"
    }else{
        // If element contains contracted class instead then toggle it and replace it for expanded class
        expandee.classList.add( expandedClass );
        expandee.classList.remove( contractedClass );
        if(ele)
            ele.innerText = "less"
    }
};

const divSwapper = (node1, node2)=>{
    node1.parentNode.replaceChild(node1, node2);
    node1.parentNode.insertBefore(node2, node1); 
}

export { expandABox, divSwapper }