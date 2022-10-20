import { Buttonz, BoxTitle } from '../form/formcomps';

function MsgBox({errStacks, subState}){
    if(errStacks.formdata?.length > 0 && errStacks.substate === subState){
        let bbx = [];
        errStacks.formdata.forEach((element, i) => {
            let eleID = errStacks.formdata[i]?.id;
            let the_msg = errStacks.formdata[i]?.msg;
            let the_ele = document.getElementById(eleID);
            bbx.push(
                <div key={i} className='errorbox' id='errorbox' style={{top: parseInt(the_ele.getBoundingClientRect().bottom)-5+"px", left: parseInt(the_ele.getBoundingClientRect().left)+15+"px"}}><Buttonz data={{value:"X", class:"error-box-closer", func:(e)=>{ errStacks.intervalId=null; errStacks.formdata=[]; errStacks.substate=null; e.target.parentNode.remove() } }} /><BoxTitle data={{text:`${the_msg}`, type:"span", class:"errorboxEle" }}/></div>
            )
        });
        return ( <div> {bbx} </div> )
    }
}

export {MsgBox}