import React, { useContext } from 'react';
import { Buttonz, BoxTitle } from '../form/formcomps';
import { MsgContext } from "../../context/msgcontext";
const defaultErrorStack = { intervalId:null, formdata:[], substate:null };

function MsgBox({ substate }){
    const { msgStacks, setMsgStacks } = useContext( MsgContext );

    if( msgStacks.formdata?.length > 0 ){
        let bbx = [];
        msgStacks.formdata.forEach((element, i) => {
            // let eleID = msgStacks.formdata[i]?.id;
            let the_msg = msgStacks.formdata[i]?.msg;
            // let the_ele = document.getElementById(eleID);
            bbx.push( <div key={i} > <BoxTitle data={{text:`${i}. ${the_msg}`, type:"span", class:"errorboxEle" }}/> </div> )
        });
        return ( <div className='errorbox' id='errorbox' style={{top: "15px", right: "15px" }} > <div style={{width:"20px", height:"20px", margin:"0px"}}><Buttonz data={{value:"X", class:"error-box-closer", func:(e)=>{setMsgStacks( defaultErrorStack )} }} /> </div> {bbx} </div> )
    }
}

export { MsgBox }