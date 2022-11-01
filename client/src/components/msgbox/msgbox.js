import React, { useContext, useEffect } from 'react';
import { Buttonz, BoxTitle } from '../form/formcomps';
import { MsgContext } from "../../context/msgcontext";
import './msgbox.css'
const defaultErrorStack = { messages:[], formdata:[], substate:null };

function MsgBox({ substate }){
    const { msgStacks, setMsgStacks } = useContext( MsgContext );
    if( msgStacks.messages?.length > 0 ){
        let bbx = [];
        msgStacks.messages.forEach((element, i) => {
            let the_msg = msgStacks.messages[i]?.msg;
            bbx.push( <div key={i} > <BoxTitle data={{text:`${i+1}. ${the_msg}`, textType:"span", divClass:"errorboxEle" }}/> </div> )
        });
        return ( <div className='errorbox' id='errorbox' style={{top: "15px", right: "15px" }} > <div style={{width:"20px", height:"20px", margin:"0px"}}><Buttonz data={{value:"X", class:"error-box-closer", func:(e)=>{setMsgStacks( defaultErrorStack )} }} /> </div> {bbx} </div> )
    }

    if( msgStacks.formdata?.length > 0 ){
        let bbx = [];
        msgStacks.formdata.forEach((element, i) => {
            // let eleID = msgStacks.formdata[i]?.id;
            let the_msg = msgStacks.formdata[i]?.msg;
            // let the_ele = document.getElementById(eleID);
            bbx.push( <div key={i} > <BoxTitle data={{text:`${i+1}. ${the_msg}`, textType:"span", divClass:"errorboxEle" }}/> </div> )
        });
        return ( <div className='errorbox' id='errorbox' style={{top: "15px", right: "15px" }} > <div style={{width:"20px", height:"20px", margin:"0px"}}><Buttonz data={{value:"X", class:"error-box-closer", func:(e)=>{setMsgStacks( defaultErrorStack )} }} /> </div> {bbx} </div> )
    }
}

export default MsgBox;