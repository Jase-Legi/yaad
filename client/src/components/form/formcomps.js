function BoxTitle( { data } ){
    // console.log(`type:${ data.textType }`)
    switch ( data.textType ) {
        case 'h2':
            data.textType = <h2 className={( data.textClass )? data.textClass :''} id={( data.textID )? data.textID :''}>{ data.text }</h2>;
            break;
        case 'span':
            data.textType = <span className={( data.textClass )? data.textClass :''} id={( data.textID )? data.textID :''}>{ data.text }</span>;
            break;
        case 'h1':
            data.textType = <h1 className={( data.textClass )? data.textClass :''} id={( data.textID )? data.textID :''}>{ data.text }</h1>;
            break;
        case 'h3':
                data.textType = <h3 className={( data.textClass )? data.textClass :''} id={( data.textID )? data.textID :''}>{ data.text }</h3>;
                break;
        case 'h4':
            data.textType = <h4 className={( data.textClass )? data.textClass :''} id={( data.textID )? data.textID :''}>{ data.text }</h4>;
            break;
        default:
            break;
    }
    return ( <div className={( data.divClass )? data.divClass :''} id={( data.divID )? data.divID :''}> { data.textType } </div> )
};

function Buttonz( { data} ){
    return (
        <button className={( data.class )? data.class :''} id={( data.id )? data.id :''} style={{zIndex: 11}} onClick={ data.func }> { data.value } </button>
    )
};

function DaInput( { data } ){
    let daInput;
    
    if( data.hidden){
        switch ( data.type) {
            case 'file':
                daInput = <input className={( data.typeClass )? data.typeClass :''} id={( data.typeId )? data.typeId :''} name={( data.name )? data.name :''} readOnly={( data.readOnly)? data.readOnly:false} type='file' multiple={( data.multiple )? data.multiple :''} accept={( data.accept)? data.accept:'*'} onChange={( data.onChange )? data.onChange :()=>{ return; }} hidden/>;
                break;
            case 'textarea':
                daInput = <textarea className={( data.typeClass )? data.typeClass :''} id={( data.typeId )? data.typeId :'' } name={( data.name )? data.name :''} value={ data.value } readOnly={( data.readOnly)? data.readOnly:false} onChange={( data.onChange )? data.onChange :()=>{ return; }} hidden></textarea>;
                break;
            case 'text':
                daInput = <input className={( data.typeClass )? data.typeClass :''} id={( data.typeId )? data.typeId :'' } name={( data.name )? data.name :''} type=' data.text ' value={ data.value } readOnly={( data.readOnly)? data.readOnly:false} onChange={( data.onChange )?(e)=> data.onChange(e):()=>{ return; }} hidden/>;
                break;
            default:
                break;
        }
        return(daInput);
    }else{
        switch ( data.type) {
            case 'file':
                daInput = <input className={( data.typeClass )? data.typeClass :''} id={( data.typeId )? data.typeId :''} name={( data.name )? data.name :''} type='file' multiple={( data.multiple )? data.multiple :''} accept={( data.accept)? data.accept:'*'} onChange={( data.onChange )? data.onChange :()=>{ return; }} onClick={( data.onClick )?(e)=> data.onClick :()=>{ return; }}/>;
                break;
            case 'textarea':
                daInput = <textarea className={( data.typeClass )? data.typeClass :''} id={( data.typeId )? data.typeId :'' } name={( data.name )? data.name :''} placeholder={( data.placeholder )? data.placeholder :''} onChange={( data.onChange )? data.onChange :()=>{ return; }} onClick={( data.onClick )?(e)=> data.onClick (e):()=>{ return; }} ></textarea>;
                break;
            case 'text':
                daInput = <input className={( data.typeClass )? data.typeClass :''} id={( data.typeId )? data.typeId :'' } name={( data.name )? data.name :''} type=' data.text ' placeholder={( data.placeholder )? data.placeholder :''} onChange={( data.onChange )? data.onChange :()=>{ return; }} onClick={( data.onClick )?(e)=> data.onClick (e):()=>{ return; }}/>;
                break;
            case 'number':
                daInput = <input className={( data.typeClass )? data.typeClass :''} id={( data.typeId )? data.typeId :'' } name={( data.name )? data.name :''} type='number' placeholder={( data.placeholder )? data.placeholder :''} onChange={( data.onChange )? data.onChange :()=>{ return; }} onClick={( data.onClick )?(e)=> data.onClick (e):()=>{ return; }} />;
                break;
            default:
                break;
        }
        return( <div className={( data.class )? data.class :''} id={( data.id )? data.id :''}> {daInput} </div> );
    }
};

export {DaInput, Buttonz, BoxTitle,}