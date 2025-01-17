import React, { useContext, useEffect } from 'react';
import { hideLoading, showLoading } from "../ui/loading";
import { BoxTitle } from '../form/formcomps';
import { MsgContext } from "../../context/msgcontext";
import { StateContext } from '../../context/StateContext';
import "./codeEditor.css";


const defaultErrorStack = { messages:[], formdata:[], substate:null };

const setNumbers = async ( e, inputText )=>{
    document.getElementById("solidityEditor").value = inputText;
    let numberOfLines = inputText.split('\n').length;
    let newlen;

    if ( numberOfLines > document.getElementById('lineNumbers')?.childElementCount && document.getElementById('lineNumbers')?.childElementCount !== 0 ){
        newlen = document.getElementById('lineNumbers')?.childElementCount;
        for ( newlen; newlen < numberOfLines; newlen++ ) {
            document.getElementById('lineNumbers').innerHTML += `<span></span>`;
        }
    }

    if( numberOfLines < document.getElementById('lineNumbers')?.childElementCount ){
        newlen = document.getElementById('lineNumbers')?.childElementCount - numberOfLines;
        // for ( numberOfLines; numberOfLines < newlen; numberOfLines++ ) {
        let indx = 0;
        while ( indx < newlen ) {
            document.getElementById('lineNumbers').childNodes[numberOfLines].remove();
            indx++;
        }
    }

    if ( document.getElementById('lineNumbers')?.childElementCount === 0 ){
        let indx = 0;
        while ( indx < numberOfLines ) {
            document.getElementById('lineNumbers').innerHTML += `<span></span>`;
            indx++;
        }
    }

    document.getElementById("solidityEditor").style.height = (document.getElementById('lineNumbers').clientHeight+20)+"px";
    return hideLoading();
}

function CodeEditor({ data, substate }){
    const { msgStacks, setMsgStacks } = useContext( MsgContext );
    const { state, setState } = useContext( StateContext );
    console.log(`state: ${JSON.stringify(state)}`)
    let activecontract;


    // ************************************************************************************************************************
    // if( !state.formVals ){
    //     setState((prev)=>({...prev, formVals: {...prev.formVals, contract:"", addContract:{...prev.formVals.addContract, active:false }}}))
    // }
    // ************************************************************************************************************************

    useEffect( ()=>{
        if ( state.currsubState === "RandomGenerator-LayerOptions-Write-Contract" ){
            showLoading();
            
            if( !state.formVals ){
                setState((prev)=>({...prev, formVals: {...prev.formVals, contract:"", addContract: { active:true, overwrite:true } }}))
            }

            document.addEventListener('paste', (e)=>{
                if ( !state.formVals.pasteDisclaimer ) {
                    if ( e.target.getAttribute("class") === "solidityEditor" ){
                        let paste = ( e.clipboardData || window.clipboardData || document.clipboardData ).getData( 'text' );
                        e.target.focus();
                        const start = e.target.selectionStart;
                        const end = e.target.selectionEnd;
                        const textAreaText = e.target.value;
                        const firstPart = textAreaText.substring( 0, start );
                        const secondPart = textAreaText.substring( end, textAreaText.length );
                        state.formVals.pasteDisclaimer = true;
                        setState((prev)=>({...prev, formVals:{...prev.formVals,contract:firstPart+paste+secondPart }, modal:{ header:"WARNING!", message:`You just pasted code into the editor please ensure you understand the code before deploying to prevent yourself from being comprimised/scammed!`, func:()=>{ return setState( (prev)=>({...prev, modal:null, formVals:{...prev.formVals, pasteDisclaimer:true} } ) ); } } } ))
                        return hideLoading();
                    }
                }
            });

            if ( state.formVals.addContract?.active === true ) {
                document.getElementById("addSolFile").click();
            }
            
            // eslint-disable-next-line react-hooks/exhaustive-deps
            activecontract = state.formVals.contract[ state.formVals.activeContractIndex ]?.contract;
            setNumbers( null, activecontract );
            return hideLoading();
        }
        return;
    },[ state.formVals, state.modal, setState, state.currsubState ])
    
    const newline = activecontract?.split('\n');
    const newlineLen = newline?.length;
    let boxxcont = [], bbx = [];
    
    for ( let indx = 0; indx < newlineLen; indx++){
        if( newline[ indx ].includes('contract ') && newline[ indx ].split('contract ')[0].trim() === ""  && state.formVals.activeContractIndex === 0 ){
            console.log(`contract name: ${newline[ indx ].split('contract ')[1].trim().split(" ")[0]}`);
        }

        boxxcont.push(<span key={indx}></span>);
    }

    const delContract =  (e, ind)=>{
        showLoading();
        state.formVals.contract.splice(ind, 1);
        const mainContractLineSplit = state.formVals.contract[ 0 ]?.contract?.split('\n');
        const mainContractLineSplitLen = mainContractLineSplit?.length;
        let indx = 0;

        while ( indx < mainContractLineSplitLen ){
            if( mainContractLineSplit[ indx ].includes(`import "./import_${ind}.sol";`) ){
                mainContractLineSplit.splice( (indx), 1 );
                break;
            }

            if( mainContractLineSplit[ indx ].includes('contract ') ){
                break;
            }

            indx++
        }

        state.formVals.contract[ 0 ].contract = mainContractLineSplit.join('\n');
        return setState((prev)=>({...prev, formVals:{...prev.formVals, activeContractIndex: 0}}));
    };

    state.formVals?.contract?.forEach((element, ind) => {
        let delbttn = (ind !== 0)?<button style={{ backgroundColor:"white", fontSize:"10px", height:"20px", width:"20px", borderRadius:"10px", padding:"2px", zIndex:"5", fontWeight:"700", cursor:"pointer", margin:"0px 0px auto -20px" }} onClick={(e)=>delContract(e, ind) } >X</button>:"";
        bbx.push(<><div key={ind} className='solTabs' style={{padding:"9px 0px", backgroundColor:( ind === state.formVals.activeContractIndex )?"rgb(24, 24, 25)":"transparent"}} onClick={(e)=>setState((prev)=>({...prev, formVals:{...prev.formVals, activeContractIndex: ind}}))}><span>{element.name}</span></div>{delbttn}</>)
    });
    
    const handleContractUpload = (e)=>{
        setState((prev)=>({
            ...prev,
            modal:{
                ...prev.modal,
                func:()=>{
                    return setState((prev)=>({
                        ...prev,formVals:{
                            ...prev.formVals,
                            addContract:null 
                        },
                        modal:null
                    }))
                },
                header:"OVERWRITE?",
                message:"Would you like to overwrite current active contract? If so click yes, otherwise click no.",
                options:[
                    {
                        name:"YES",
                        func:()=>{
                            return setState((prev)=>({
                                ...prev,
                                modal: null,
                                formVals:{
                                    ...prev.formVals,
                                    addContract: { active:true, overwrite:true }
                                }
                            }))
                        } 
                    },
                    {
                        name:"NO",
                        func:()=>{
                            return setState((prev)=>({
                                ...prev,
                                modal: null,
                                formVals: {
                                    ...prev.formVals,
                                    addContract: { active:true, overwrite:false }
                                }
                            }))
                        }
                    }
                ]
            }
        }))
    };

    const addNewContract = (e)=>{
        showLoading();
        const readr = new FileReader();
        readr.addEventListener("load", (ee)=>{
            const text = (ee.target.result);
            let contract;
            let activeindex = 0;
            if( state.formVals.addContract?.overwrite === false ){
                activeindex = state.formVals.contract.length;
                contract = state.formVals.contract;
                contract.push({name: `import_${activeindex}`, contract:ee.target.result});

                const mainContractLineSplit = state.formVals.contract[ 0 ]?.contract?.split('\n');
                const mainContractLineSplitLen = mainContractLineSplit?.length;
                let indx = 0;

                while ( indx < mainContractLineSplitLen ){
                    if( mainContractLineSplit[ indx ].includes('pragma solidity ') ){
                        // console.log(`------- ${indx}) line: '${newline[ indx ]}'`);
                        mainContractLineSplit.splice( (indx+1), 0, `import "./import_${activeindex}.sol";` );
                        break;
                    }
                    indx++
                }
                // mainContractLineSplit.join('\r\n');
                state.formVals.contract[ 0 ].contract = mainContractLineSplit.join('\n');
                return setState((prev)=>({...prev, modal:null, formVals:{...prev.formVals, contract, activeContractIndex: activeindex, addContract:null }}));
            }

            const mainContractLineSplit = text.split('\n');
            const mainContractLineSplitLen = mainContractLineSplit?.length;

            if( state.formVals.activeContractIndex === 0 ) {
                
                let indx = 0, pragma = false, pragmaIndex = null, existingImports = [], existingImportsLength = state.formVals.contract.length;
                if ( existingImportsLength > 1 ){
                    for(let daind = 1; daind < existingImportsLength; daind++ ){
                        existingImports.push(`import "./import_${daind}.sol";`)
                    }
                }
    
                while ( indx < mainContractLineSplitLen ){
                    if ( mainContractLineSplit[ indx ].includes('import ') && mainContractLineSplit[ indx ].split('import ')[0].trim() === ""){
                        mainContractLineSplit.splice( (indx), 1 );
                    }

                    if( pragma === true && !mainContractLineSplit[ indx ].includes('import ') && mainContractLineSplit[ indx ].trim()[0] !== "/" && mainContractLineSplit[ indx ].trim()[0] !== undefined ){
                        mainContractLineSplit.splice((pragmaIndex+1), 0, ...existingImports )
                        break;
                    }

                    if( mainContractLineSplit[ indx ].includes('pragma ') && mainContractLineSplit[ indx ].split('pragma ')[0].trim() === ""){
                        pragma = true;
                        pragmaIndex = indx;
                    }

                    indx++
                }
            }
            
            contract = state.formVals.contract;
            contract[state.formVals.activeContractIndex].contract = (state.formVals.activeContractIndex === 0)?mainContractLineSplit.join('\n'):text;
            setState((prev)=>({...prev, modal:null, formVals:{...prev.formVals, contract, addContract:{...prev.formVals.addContract, active:false } }}));
            return hideLoading();
        });
        readr.readAsText( e.target.files[0] ); 
    };

    let numberSideBar = <div className="lineNumbers" id="lineNumbers" >{boxxcont}</div>
    return (
        <div className='LayerUpldBox' style={{padding:"20px"}}>
            <button className='closeBox' onClick={()=> setState( (prev)=>({...prev, state:"home", data:{ coll_name : null, coll_symbol : null, layers:[] }, currsubState:null, temp_index: null }) ) }>X</button>
            {/* <BoxTitle data={{divClass:"contractEditorTitle", textType:'h2', text:'NFT Contract ( ERC721 )'}}/> */}
            <BoxTitle data={{divClass:"contractEditorTitle", textType:'span', text:'Edit Resume Below'}}/>
            <div className="contractEditorToolBar" >
                <div className="toolBarElement" onClick={(e)=>{let contract = state.formVals.contract; contract[ state.formVals.activeContractIndex ].contract = document.getElementById("solidityEditor").value; setState((prev)=>({...prev, data:{...prev.data, contracts:contract}, formVals:{...prev.formVals, contract, } }) )}}>
                    <img src='./save_icon.svg' alt='' />
                    <span> save </span>
                </div>
                <label className="toolBarElement" id="addSolFile" htmlFor='contractUpld' onClick={(e)=>( state.formVals.addContract?.active )?'':handleContractUpload()}>
                    <input type={"file"} name="contractUpld" id="contractUpld" onChange={(e)=> addNewContract(e) } hidden/>
                    <h2>+</h2>
                    <span> New Resume </span>
                </label>
            </div>
            <div className='solTabsWrapper'>{bbx}</div>
            <div className="editor" id="editor" >
                {numberSideBar}
                <textarea className='solidityEditor' id='solidityEditor' onKeyUp={(e)=>{ if( e.key === "Enter" || e.key === "Backspace" || e.key === "Delete" || e.ctrlKey ){ return setNumbers( e, e.target.value ) }}} onChange={(e)=>state.formVals.contract[ state.formVals.activeContractIndex ].contract = e.target.value } />
            </div>
        </div>
    )
}

export default CodeEditor;