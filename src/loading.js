import React from 'react';
import './loading.scss';

export default function Loading({
    loading,
    loadingTexts,
}){
    // console.log("loading: ", loading)
    //TODO update the loading text as it comes around.

    return(
        // <div className="Loading"></div>
        <div>
            <div className={"Loading " + (loading ? "show" : "")}>
                <div className="double-bounce1"></div>
                <div className="double-bounce2"></div>
            </div>
            <div className={"Loading-overlay " + (loading ? "show" : "")}></div>
        </div>
    );
}
