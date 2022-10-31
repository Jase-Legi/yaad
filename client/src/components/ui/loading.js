import './loading.css'
function LoadingBox({ data } ){
    // console.log(`loading data: ${JSON.stringify(data)}`)
    return(
        <div id='loadingpopup' className={(data?.state)?data.state:'inactive'}>
            <div id='loadingbttn' >
                <img src="./loading.svg" alt=""/>
                <div className='loadingbttn_text_box'>
                    <span style={{color:"white"}}>Please Wait</span>
                </div>
            </div>
        </div>
    )
}

const showLoading = (e)=>{
    document.getElementById('loadingpopup')?.classList.remove('inactive');
    if ( e ) {
        if ( !e.target?.classList.contains('inactive') ){
            e.target?.classList.add('inactive');
        }
    }
}

const hideLoading = (e)=>{

    document.getElementById('loadingpopup')?.classList.add('inactive');
    if ( e ) {
        if ( e.target?.classList.contains('inactive') ){
            e.target?.classList.remove('inactive');
        }
    }
}

export { LoadingBox, showLoading, hideLoading };