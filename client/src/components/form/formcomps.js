function BoxTitle(props){
    let textType;
    switch (props.data.type) {
        case 'h2':
            textType = <h2 className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''}>{props.data.text}</h2>;
            break;
        case 'span':
            textType = <span className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''}>{props.data.text}</span>;
            break;
        case 'h1':
            textType = <h1 className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''}>{props.data.text}</h1>;
            break;
        case 'h3':
                textType = <h3 className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''}>{props.data.text}</h3>;
                break;
        case 'h4':
            textType = <h4 className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''}>{props.data.text}</h4>;
            break;
        default:
            break;
    }
    return ( <div className={(props.data.class)?props.data.class:''} id={(props.data.id)?props.data.id:''}> {textType} </div> )
};

function Buttonz(props){
    return (
        <button className={(props.data.class)?props.data.class:''} id={(props.data.id)?props.data.id:''} style={{zIndex: 11}} onClick={props.data.func}> {props.data.value} </button>
    )
};

function DaInput(props){
    let daInput;
    
    if(props.data.hidden){
        switch (props.data.type) {
            case 'file':
                daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''} name={(props.data.name)?props.data.name:''} readOnly={(props.data.readOnly)?props.data.readOnly:false} type='file' multiple={(props.data.multiple)?props.data.multiple:''} accept={(props.data.accept)?props.data.accept:'*'} onChange={(props.data.onChange)?props.data.onChange:()=>{return;}} hidden/>;
                break;
            case 'textarea':
                daInput = <textarea className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} value={props.data.value} readOnly={(props.data.readOnly)?props.data.readOnly:false} onChange={(props.data.onChange)?props.data.onChange:()=>{return;}} hidden></textarea>;
                break;
            case 'text':
                daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} type='text' value={props.data.value} readOnly={(props.data.readOnly)?props.data.readOnly:false} onChange={(props.data.onChange)?(e)=>props.data.onChange(e):()=>{return;}} hidden/>;
                break;
            default:
                break;
        }
        return(daInput);
    }else{
        switch (props.data.type) {
            case 'file':
                daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:''} name={(props.data.name)?props.data.name:''} type='file' multiple={(props.data.multiple)?props.data.multiple:''} accept={(props.data.accept)?props.data.accept:'*'} onChange={(props.data.onChange)?props.data.onChange:()=>{return;}} onClick={(props.data.onClick)?(e)=>props.data.onClick:()=>{return;}}/>;
                break;
            case 'textarea':
                daInput = <textarea className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} placeholder={(props.data.placeholder)?props.data.placeholder:''} onChange={(props.data.onChange)?props.data.onChange:()=>{return;}} onClick={(props.data.onClick)?(e)=>props.data.onClick(e):()=>{return;}} ></textarea>;
                break;
            case 'text':
                daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} type='text' placeholder={(props.data.placeholder)?props.data.placeholder:''} onChange={(props.data.onChange)?props.data.onChange:()=>{return;}} onClick={(props.data.onClick)?(e)=>props.data.onClick(e):()=>{return;}}/>;
                break;
            case 'number':
                daInput = <input className={(props.data.typeClass)?props.data.typeClass:''} id={(props.data.typeId)?props.data.typeId:'' } name={(props.data.name)?props.data.name:''} type='number' placeholder={(props.data.placeholder)?props.data.placeholder:''} onChange={(props.data.onChange)?props.data.onChange:()=>{return;}} onClick={(props.data.onClick)?(e)=>props.data.onClick(e):()=>{return;}} />;
                break;
            default:
                break;
        }
        return( <div className={(props.data.class)?props.data.class:''} id={(props.data.id)?props.data.id:''}> {daInput} </div> );
    }
};

export {DaInput, Buttonz, BoxTitle,}