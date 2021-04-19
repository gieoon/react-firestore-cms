/* DEPRECATED, was using this to edit cross-domain and display locally via iframes. */

import React, {useEffect, useState} from 'react';
import Frame from 'react-frame-component';
// Edits webpages based on a list of id's.
export default function WebpageEditor({
    // pageData, 
    children,
    setFrameLoaded,
}){
    const [editable, setEditable] = useState();
    
    useEffect(()=>{
        // Client has built in script that listens to 'highlight' event.
        // This will trigger code.
        // TODO Turn this into a npm library.
        
        // const editableElements = Array.from(
        //     iframe.querySelectorAll('.cp-editable')
        // );

        // console.log("editableElements: ", editableElements);
    }, []);

    // const iframeLoadComplete = () => {
    //     const iframe = document.querySelector('iframe').contentWindow;
    //     iframe.postMessage('startEdit', '*' /*window.location.href*/);
    // }

    return(
        // <div className="WebpageEditor">
            // <iframe src={pageData.liveURL} onLoad={()=>{iframeLoadComplete()}} width="100%" height="100%" title="Client Website" />
            <Frame
                id="editingFrame"
                height="100%"
                width="100%"
                // initialContent='<!DOCTYPE html><html><head><style>body:{margin:0;}</style></head><body></body></html>'
                contentDidMount={()=>{
                    // console.log('Frame mounted!!!: ');
                    setFrameLoaded(true);
                }}
            >
                {children}
            </Frame>

        // </div>
    )
}