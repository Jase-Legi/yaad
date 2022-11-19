import React, { useContext } from 'react';
import { Buttonz, BoxTitle } from '../form/formcomps';
import { MsgContext } from "../../context/msgcontext";
import { StateContext } from '../../context/StateContext';
import './msgbox.css';

const defaultErrorStack = { messages:[], formdata:[], substate:null };

function MsgBox({ data, substate }){
    const { msgStacks, setMsgStacks } = useContext( MsgContext );
    const { state, setState } = useContext( StateContext );
    if( msgStacks.messages?.length > 0 ){       
        let bbx = [];
        msgStacks.messages.forEach((element, i) => {
            let the_msg = msgStacks.messages[i];
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

    if( state.modal ){
        let optns = null;
        if( state.modal.options ){
            optns = [];
            state.modal.options.forEach((ele, i)=>{
                optns.push( <button key={i} style={(ele.style)?ele.style:{ width:"100%", boxSizing:"border-box", height:"50px", borderRadius:"10px",  cursor:"pointer", fontWeight:"700", fontSize:"15px", margin:"10px 0px"}} className="optionButton" onClick={(e)=>ele.func()}>{ ele.name }</button> )
            })
        }

        return(
            <div id='modalpopup' >
                <div id='modalBox' >
                <button className="closeBox" onClick={(e)=>state.modal.func()}>X</button>
                    <div style={{ width: "100%", boxSizing:"border-box", borderBottom:"1px solid rgb(52, 52, 52)", marginBottom:"15px"}}>
                        <h2>{state.modal.header}</h2>
                    </div>
                    <div style={{ width: "100%", boxSizing:"border-box", fontSize:"12px", margin:"10px 0px 20px 0px", textAlign:"left"}} >
                        <span>{state.modal.message}</span>
                    </div>
                    <div>
                        {optns}
                    </div>
                </div>
            </div>
        )
    }
}

export default MsgBox;