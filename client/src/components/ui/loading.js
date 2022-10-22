
function LoadingBox({ data } ){
    // console.log(`loading data: ${JSON.stringify(data)}`)
    return(
        <div id='loadingpopup' className='inactive'>
            <div id='loadingbttn' >
                <img src="./loading.svg" alt=""/>
                <div className='loadingbttn_text_box'>
                    <span style={{color:"white"}}>Please Wait</span>
                </div>
            </div>
        </div>
    )
}

const showLoading = ()=>{ document.getElementById('loadingpopup')?.classList.remove('inactive'); }

const hideLoading = ()=>{ document.getElementById('loadingpopup')?.classList.add('inactive'); }

export { LoadingBox, showLoading, hideLoading };