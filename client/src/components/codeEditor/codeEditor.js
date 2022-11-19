import React, { useContext, useEffect } from 'react';
import { hideLoading, showLoading } from "../ui/loading";
import { BoxTitle } from '../form/formcomps';
import { MsgContext } from "../../context/msgcontext";
import { StateContext } from '../../context/StateContext';


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
    let activecontract;
    
    useEffect( ()=>{
        if ( state.currsubState === "RandomGenerator-LayerOptions-Write-Contract" ){
            showLoading();
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
        if( newline[ indx ].includes('contract ') && newline[ indx ].split('contract ')[0].trim() === ""  ){
            console.log(`------- ${indx}) line: '${newline[ indx ]}'`)
        }

        boxxcont.push(<span key={indx}></span>);
    }

    state.formVals.contract.forEach((element, ind) => {
        bbx.push(<div key={ind} className='solTabs' onClick={(e)=>setState((prev)=>({...prev, formVals:{...prev.formVals, activeContractIndex: ind}}))}>{element.name}</div>)
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
                return setState((prev)=>({...prev, modal:null, formVals:{...prev.formVals, contract, activeContractIndex: activeindex, addContract:null }}));
            }
            contract = state.formVals.contract;
            contract[state.formVals.activeContractIndex].contract = text;
            setState((prev)=>({...prev, modal:null, formVals:{...prev.formVals, contract, addContract:{...prev.formVals.addContract, active:false } }}));
            return hideLoading();
        });
        readr.readAsText( e.target.files[0] ); 
    };

    let numberSideBar = <div className="lineNumbers" id="lineNumbers" >{boxxcont}</div>
    return (<div className='LayerUpldBox' style={{padding:"20px"}}>
        <BoxTitle data={{divClass:"contractEditorTitle", textType:'h2', text:'NFT Contract ( ERC721 )'}}/>
        <BoxTitle data={{divClass:"contractEditorTitle", textType:'span', text:'Default contract courtesy of openzeppelin. Before editing/changing contract, ensure that you understand the code to avoid being scammed.'}}/>
        <div className="contractEditorToolBar" >
            <div className="toolBarElement" onClick={(e)=>{let contract = state.formVals.contract; contract[ state.formVals.activeContractIndex ].contract = document.getElementById("solidityEditor").value; setState((prev)=>({...prev, data:{...prev.data, contracts:contract}, formVals:{...prev.formVals, contract, } }) )}}>
                <img src='./save_icon.svg' alt='' />
                <span> save </span>
            </div>
            <label className="toolBarElement" id="addSolFile" htmlFor='contractUpld' onClick={(e)=>( state.formVals.addContract?.active )?'':handleContractUpload()}>
                <input type={"file"} name="contractUpld" id="contractUpld" onChange={(e)=> addNewContract(e) } hidden/>
                <h2>+</h2>
                <span> new contract (.sol) </span>
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